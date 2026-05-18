import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { createClient } from "@insforge/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

const STYLE_PROMPTS: Record<string, string> = {
  baseball:
    "professional baseball broadcast shot, batter mid-swing in a packed major league stadium, dramatic stadium floodlights, blurred cheering crowd in the background, telephoto lens with shallow depth of field, cinematic sports photography, hyper-detailed, vibrant colors",
  idol:
    "k-pop idol fancam style shot, idol performing center stage with vibrant concert lights, lens flare, sparkles, audience silhouettes cheering with light sticks, high-energy concert atmosphere, professional stage lighting, photo-realistic",
  showme:
    "hip-hop rap competition audience reaction shot, energetic young crowd at an indoor rap battle stage, dim moody lighting with deep red and purple stage lights, raw urban concert atmosphere, gritty cinematic photography, dramatic contrast",
  street:
    "candid street fashion photography, stylish young person wearing trendy streetwear walking in a vibrant urban setting, editorial fashion magazine style, natural golden hour daylight, urban architecture in the background, high-quality fashion photography",
};

type ReplicateOutputLike =
  | string
  | { url(): URL | string }
  | { toString(): string };

function extractUrl(output: unknown): string {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && output.length > 0) {
    return extractUrl(output[0]);
  }
  if (output && typeof output === "object") {
    const o = output as ReplicateOutputLike;
    if (typeof (o as { url?: unknown }).url === "function") {
      const u = (o as { url: () => URL | string }).url();
      return typeof u === "string" ? u : u.toString();
    }
    const s = String(output);
    if (s.startsWith("http")) return s;
  }
  throw new Error("Unexpected Replicate output format");
}

export async function POST(request: NextRequest) {
  try {
    const { style } = (await request.json()) as { style?: string };

    if (!style || !(style in STYLE_PROMPTS)) {
      return NextResponse.json({ error: "Invalid style" }, { status: 400 });
    }
    const prompt = STYLE_PROMPTS[style];

    const replicateToken = process.env.replicate_api_token;
    const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
    const insforgeAdminKey = process.env.INSFORGE_API_KEY;

    if (!replicateToken || !insforgeUrl || !insforgeAdminKey) {
      return NextResponse.json(
        { error: "Server is missing required environment variables" },
        { status: 500 },
      );
    }

    // 1. Generate image with Imagen-4
    const replicate = new Replicate({ auth: replicateToken });
    const output = await replicate.run("google/imagen-4", {
      input: {
        prompt,
        aspect_ratio: "16:9",
        safety_filter_level: "block_only_high",
        output_format: "png",
      },
    });
    const replicateImageUrl = extractUrl(output);

    // 2. Download the generated image
    const imgResp = await fetch(replicateImageUrl);
    if (!imgResp.ok) {
      throw new Error(`Failed to fetch generated image (${imgResp.status})`);
    }
    const arrayBuffer = await imgResp.arrayBuffer();
    const filename = `${style}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.png`;
    const file = new File([arrayBuffer], filename, { type: "image/png" });

    // 3. Upload to InsForge Storage (admin)
    const insforge = createClient({
      baseUrl: insforgeUrl,
      anonKey: insforgeAdminKey,
    });

    const objectKey = `${style}/${filename}`;
    const { data: uploaded, error: uploadError } = await insforge.storage
      .from("generations")
      .upload(objectKey, file);

    if (uploadError || !uploaded) {
      throw uploadError ?? new Error("Storage upload failed");
    }

    return NextResponse.json({
      url: uploaded.url,
      key: uploaded.key,
      prompt,
      style,
    });
  } catch (err) {
    console.error("[generate-image] error", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

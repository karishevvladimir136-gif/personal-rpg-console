// Sample art jobs for the synthetic Stage 5 previews (generated once with
// scripts/fal-image-smoke.mjs into public/preview/stage-5/). Preview-only content.
import type { FalComposition, FalImageModelId } from "../../visual-frame/fal-image.ts";

export type PreviewArtJob = {
  name: string;
  composition: FalComposition;
  model: FalImageModelId;
  subject: string;
  description: string;
  style: string;
};

const steam = "Steampunk over the ruins of an old world, oil painting, warm brass light, smoke and violet aether glow, painterly texture.";
const noir = "Rain-soaked neon noir, cinematic digital painting, teal and magenta reflections, deep shadows, film grain.";

export const previewArtJobs: PreviewArtJob[] = [
  { name: "hero-portrait", composition: "portrait", model: "fal-ai/flux-2-pro", subject: "James Hale", style: steam, description: "A wiry man in his thirties with a short dark beard, a travelling mechanic and mage, warm amber light in his eyes, worn brown leather coat, brass goggles pushed up on his forehead, a pocket-watch chain on his waistcoat, friendly wry smile." },
  { name: "hero-figure", composition: "figure", model: "fal-ai/flux-2-pro", subject: "James Hale", style: steam, description: "The same wiry sorcerer-mechanic seen in full: worn leather coat, tool belt with a smuggler's satchel, a heavy engraved revolver holstered at the hip, army boots, faint red scales at one temple." },
  { name: "meg", composition: "portrait", model: "fal-ai/flux-2-pro", subject: "Red Meg", style: steam, description: "A confident red-haired woman airship pilot in her forties, freckles, aviator cap with goggles, fur-collared brown leather flight jacket, knowing smile." },
  { name: "urzul", composition: "portrait", model: "fal-ai/flux-2-pro", subject: "Urzul Ironside", style: steam, description: "A massive orc warrior with green-grey skin, tusks, one side of his torso plated with riveted iron, many scars, calm eyes." },
  { name: "wolf", composition: "portrait", model: "fal-ai/flux-2-pro", subject: "Wolf Kessler", style: steam, description: "A grizzled German engineer-soldier in his fifties, grey stubble, a brass monocle, oil-stained officer coat." },
  { name: "zarga", composition: "portrait", model: "fal-ai/flux-2-pro", subject: "Zarga", style: steam, description: "An orc shaman woman with braided black hair, chalk-white tattoos, bone and copper charms, piercing amber eyes." },
  { name: "airship", composition: "holding", model: "fal-ai/flux-2-pro", subject: "The Iron Granny", style: steam, description: "A battered old steampunk airship: patched canvas balloon, riveted wooden gondola, two brass propeller engines, one of them smoking, flying above clouds at sunrise." },
  { name: "cave", composition: "location", model: "fal-ai/flux-2-pro", subject: "Alvares family sea cave", style: steam, description: "A sea cave hangar under the cliffs of Lisbon at dawn, an old airship moored inside, lanterns, crates, fog drifting in from the Tagus river." },
  { name: "geneva", composition: "location", model: "fal-ai/flux-2-pro", subject: "Geneva", style: steam, description: "A lakeside city of spires under a shimmering violet tear in the sky, steam trams on the bridges, evening light." },
  { name: "atlas", composition: "atlas", model: "fal-ai/flux-2-pro", subject: "Atlas of Western Europe", style: steam, description: "An old hand-drawn atlas of western Europe and the Atlantic coast, parchment, sepia ink, faint compass rose, coastlines and mountains, no labels." },
  { name: "crystal", composition: "item", model: "fal-ai/flux-2/flash", subject: "Aetherite crystal", style: steam, description: "A glowing violet-blue aetherite crystal held in a small brass cage setting." },
  { name: "revolver", composition: "item", model: "fal-ai/flux-2/flash", subject: "The Argument revolver", style: steam, description: "A heavy engraved six-shot revolver with brass fittings and a worn walnut grip." },
  { name: "watch", composition: "item", model: "fal-ai/flux-2/flash", subject: "Father's pocket watch", style: steam, description: "An old silver pocket watch with a cracked glass, its hands stopped at 3:17." },
  // Second sample campaign: a narrative noir without classes, levels or ability scores.
  { name: "noir-dana", composition: "portrait", model: "fal-ai/flux-2-pro", subject: "Dana Okafor", style: noir, description: "A tired private investigator in her late thirties, close-cropped hair, a small glowing implant behind one ear, rain on a dark trench coat collar, steady eyes." },
  { name: "noir-car", composition: "holding", model: "fal-ai/flux-2-pro", subject: "Old Citroën DS", style: noir, description: "A dented vintage Citroën DS sedan retrofitted with cables and a hover kit, parked in a flooded neon alley at night." },
  { name: "noir-stack", composition: "location", model: "fal-ai/flux-2-pro", subject: "Kowloon Stack 9", style: noir, description: "A towering stacked arcology of apartments and noodle stalls, walkways in the rain, neon signs without readable text." },
  { name: "noir-chip", composition: "item", model: "fal-ai/flux-2/flash", subject: "Data chip", style: noir, description: "A small scratched data chip with a faint blue glow, lying on a wet metal table." },
];

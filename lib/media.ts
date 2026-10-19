// Media extracted in Phase 1 (see public/assets/manifest.json).
// Placeholder content from the reference site — replace with owned media before launch.
// Files under /assets are named by a hash of their contents and cached for a year (next.config.ts), so a changed
// file must get a new name. The videos are web encodes (H.264, index first so playback starts while downloading).
const VIDEOS = "/assets/videos";
const IMAGES = "/assets/images";

export const media = {
  // From bfb0bbb1….mp4 (28.7 MB): silent track dropped, black lead-in trimmed. 1080p 16:9 (13.5 MB), plus a
  // 3:4 centre crop at full height for portrait screens (7.5 MB), which only ever show the middle of the frame.
  heroVideo: {
    landscape: `${VIDEOS}/2b73d85e2a0564cdf9c10bff22974271a1a7adef.mp4`,
    portrait: `${VIDEOS}/99da4da994db1dd23cd018ba53839a852f110fbe.mp4`,
    poster: `${IMAGES}/d572687d77211d296aee3b609de7834461b2630a-1600x900.webp`,
  },
  // 1080p of the 4K 4f30b5f0….mp4 (10.8 MB → 7.3 MB).
  reelVideo: `${VIDEOS}/8b1158250f85dbea30912f7e6d5489db901dcc10.mp4`,
  reelPoster: `${IMAGES}/6f460d6677b444801d5db6c24e2f4a9a5b4b0963-1920x1080.webp`,
  // The mark cropped out of /AM.png for the particle hero: 12 KB instead of 815 KB, and it samples the same.
  particleMark: `${IMAGES}/d2e971760afaa173482669b7e347803a813876b2-700x580.webp`,
} as const;

// Emotional Spectrum cards, in the reference site's order.
// Placeholder content (client names + imagery) from the reference site — replace with your own work.
const img = (hash: string, ext = "jpg") => `/assets/images/${hash}.${ext}`;

export type SpectrumItem = { client: string; emotion: string; image: string };

export const SPECTRUM: SpectrumItem[] = [
  { client: "Joby", emotion: "Elevated", image: img("e08abf4a5d8acab47391d37a9cebe1e48cfb90e8-1305x1740") },
  { client: "Halo Industries", emotion: "Bright", image: img("0dad1fd90cf741eba62d60a346ea22ae7c596662-1500x1696", "png") },
  { client: "Cottonball", emotion: "Radiant", image: img("e991208734e35cf26c4806d7f5fc3971c395e370-1305x1740") },
  { client: "Amesa", emotion: "Optimized", image: img("721366e02ff48bd37d12edc420388acbfc204598-1305x1740") },
  { client: "Axum Capital", emotion: "Steady", image: img("4cc93136b78212da564e5030e9eafae4fe862d2d-1305x1740") },
  { client: "Shield AI", emotion: "Fortified", image: img("4051535a5666828416dd229c4aa6cb8267b60b15-1305x1740") },
  { client: "Mienne", emotion: "Turned On", image: img("8654667f24dd921a7dc25d64098c4231893c0eae-1305x1740") },
  { client: "Azione", emotion: "Polished", image: img("b778896b91919095daf92b49d70a6849e335a0e7-1305x1740") },
  { client: "FreeGame", emotion: "Ahead Of The Game", image: img("d62bd66478c8f6a3330c4310ad00f70644f4dddb-1305x1740") },
  { client: "Keyes", emotion: "At Home", image: img("3f42e1e1ae23dc31a2e1fe04c05ab7695dab5974-1305x1740") },
  { client: "Hallandale", emotion: "Well Mastered", image: img("913ea93574451f433d5a9e0a044c4149a95c1192-1305x1740") },
  { client: "Tony Robbins", emotion: "Unleashed", image: img("806ed9b33fae9391d30bd0a238b860f2591f8c2e-1305x1740") },
  { client: "Supergut", emotion: "Gutsy", image: img("e32dcff736a1e8db83031eef2ba98e2cfd5ca1f7-1305x1740") },
  { client: "Albertsons", emotion: "Healthy", image: img("8bf51c5a876a9b0b866a84c55cf9c1aff736bd47-1305x1740") },
  { client: "Veritas Veterinary Partners", emotion: "United", image: img("d2a570123fd9e36ed654a61bf2dabd69a9c84c8f-1305x1740") },
  { client: "Noble Machines", emotion: "Purposeful", image: img("ecbb709c5e84fdd27bf1b7e3d2f3ebd8765cd912-1305x1740") },
];

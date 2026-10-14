// /work Grid view, in the reference site's order.
// Placeholder content (clients, copy, imagery) from the reference site — replace with your own.
// Generated from the Phase 2 scrape (.playwright-mcp/work-page-data.json); safe to edit by hand.
import type { WorkMedia } from "@/lib/content/work";

const image = (file: string): WorkMedia => ({ type: "image", src: `/assets/images/${file}` });
const video = (file: string, poster: string): WorkMedia => ({
  type: "video",
  src: `/assets/videos/${file}`,
  poster: `/assets/images/${poster}`,
});

export type IndexCard = { client: string; title: string | null; slug: string; media: WorkMedia };
/** Featured pairs: `aspect` is the media's native ratio; large/small share a row 1169 : 576. */
export type FeaturedCard = IndexCard & { size: "large" | "small"; aspect: string };
/** Archive entries: no case study, so no link. */
export type SnapshotCard = { client: string; media: WorkMedia };

export const FEATURED_ROWS: [FeaturedCard, FeaturedCard][] = [
  [
    { client: "Joby", title: "Taking flight to new heights", slug: "joby", media: image("17534c0015f7d60167f3fea746595329b433d2a2-4400x2475.jpg"), size: "large", aspect: "4400 / 2475" },
    { client: "Noble Machines", title: "Forging a new standard for industrial robotics", slug: "noble-machines", media: image("5fd142123b36769cb924200024b2816e648f935c-1920x1080.png"), size: "small", aspect: "1920 / 1080" },
  ],
  [
    { client: "Slack", title: "Reimagining work with two industry icons", slug: "slack", media: image("2bf3a18802ac628a505e7cfd06334bd77ebc3ba6-3840x2160.jpg"), size: "small", aspect: "3840 / 2160" },
    { client: "Shield AI", title: "Building the future of defense", slug: "shield-ai", media: image("49af5eebc557e7e0b661cbc8cfcbcb1ab374fbca-2075x1275.jpg"), size: "large", aspect: "2075 / 1275" },
  ],
  [
    { client: "Salesforce", title: "Peeking into the future of work", slug: "salesforce", media: image("5c1b86d70950056e93f43446378150d345284f34-1910x2160.jpg"), size: "large", aspect: "1910 / 2160" },
    { client: "Cottonball", title: "Cultivating a couture skincare experience", slug: "cottonball", media: image("d8f48169548d2d2262eb13b67b53c514120c9dd4-1599x1185.jpg"), size: "small", aspect: "1599 / 1185" },
  ],
  [
    { client: "Halo", title: "Engineering tomorrow with the light of today", slug: "halo", media: image("f8e04c9a1ec7931bbdddb9da2857b24cf9f760a0-1599x1185.jpg"), size: "small", aspect: "1599 / 1185" },
    { client: "Gapingvoid", title: "Putting the counter in a culture company", slug: "gapingvoid", media: image("3e31bd8fc595c918c0cee43d52b8f0a7fec61e1e-4800x2700.jpg"), size: "large", aspect: "4800 / 2700" },
  ],
  [
    { client: "Amesa", title: "Pioneering engineered intelligence", slug: "amesa", media: video("4f30b5f0ecee323da4382a39ec9745136fecaa6a.mp4", "1f33813e47dd334c0290a170085afbc015eec106-3840x2160.jpg"), size: "large", aspect: "3840 / 2160" },
    { client: "Meadowell", title: "Creating an intuitive method for women to thrive", slug: "meadowell", media: image("8ab0ae073a903f8092544a190c22f81a02e09f5d-3840x2160.webp"), size: "small", aspect: "3840 / 2160" },
  ],
  [
    { client: "Axum", title: "Building value behind the scenes", slug: "axum", media: image("57f4cb81a37e09833bb7acbe3151120fe1639c3e-1800x1466.png"), size: "small", aspect: "1800 / 1466" },
    { client: "LuxNomads", title: "Reshaping the European relocation", slug: "luxnomads", media: image("68f692c54ce6fcdf5400e75b2fc48cbc1a98ace6-1911x1485.jpg"), size: "large", aspect: "1911 / 1485" },
  ],
];

export const WORK_GRID: IndexCard[] = [
  { client: "Shipyard", title: "Building a full-force multiplier", slug: "shipyard", media: image("659d5cab9ce9feb717f5de0dd4465891769607e0-4800x2700.jpg") },
  { client: "Whimsocal", title: null, slug: "whimsocal", media: image("01c9f1741af6ae2b7e77880888926836d2bdeb98-3000x1688.jpg") },
  { client: "Veritas Vet Partners", title: "Uniting a family of veterinary hospitals", slug: "veritas-vet-partners-hospital-sites", media: video("32c3ed44a9ad0a8393336c4c6ad1d691c0389f00.mp4", "5f19ea5664a913d1a4d8690a1d74dffe02aea68a-1920x1080.jpg") },
  { client: "Hydrinity", title: "Designing clarity for clinical skincare", slug: "hydrinity", media: image("e2b2ea1d8c7ab034c079fb8475011377ab3d9f01-917x1184.jpg") },
  { client: "Mienne", title: "Awakening the senses", slug: "mienne", media: image("d9edfc122cd3339223cd6d8cdd6d88e8687cc014-966x780.jpg") },
  { client: "Azione", title: "Showcasing an impressive body of work", slug: "azione", media: image("43a19284a3042d273e3225203ceb7bf507001d2b-2560x1440.png") },
  { client: "FreeGame", title: "Redefining representation for a new era of athletes", slug: "freegame", media: video("9801f76e7e4d02843d98636a67fb12b56bab9b64.mp4", "6408e74e8829f15efc0ce9743b4b1aa04c936ed7-2031x1196.jpg") },
  { client: "0G.ai", title: null, slug: "0g-ai", media: image("2850fc1748925139c2d1faab8791fdad86467fbb-3680x2070.jpg") },
  { client: "Keyes", title: "Giving a legacy brand a new lease on life", slug: "keyes", media: image("acec85430b1aac496e65d1f99cea52e9f19c23dd-2560x1395.jpg") },
  { client: "Hallandale", title: "Reemerging better to help others", slug: "hallandale", media: video("c3415da04577dbfae768d0c16c025d0871472fa0.mp4", "342f1e7f3b1e66b2e736bb1d04dc9884b7e13b4c-1428x1184.jpg") },
  { client: "ReSpin", title: "Putting a new spin on the next stage", slug: "respin", media: image("3c0f8ddab398317ffca7aa905f1da455b2f184ef-5888x3208.png") },
  { client: "Tony Robbins", title: "Unleashing a titan", slug: "tony-robbins", media: image("75c2313caa146e8eddded7a83c13b70b4e4d9fff-967x644.jpg") },
  { client: "Arcium", title: "Humanizing the future of blockchain", slug: "arcium", media: video("643f0c9177bbaee7907dcff3fab0213b6942422e.mp4", "870248108b99589be92a159f11bece50407a7b71-1920x1080.jpg") },
  { client: "OpenGradient", title: "Decentralizing the future of AI", slug: "opengradient", media: video("94cc599c944496dfba25f1e265d2fa1888da9e56.mp4", "e49a3e6469bf4bbbd6a60d3aab5a106f3859b3ba-2966x1744.jpg") },
  { client: "Turnkey", title: "Securing the future of building in crypto", slug: "turnkey", media: image("ffa8a804766563498bde1e33aec33f0e1b3649bb-1922x1081.png") },
  { client: "Aethir", title: "Amplifying access for innovation in AI", slug: "aethir", media: video("81ff53af10f1a8826f6a16fcf9bb20ac4caa2413.mp4", "614ca6c0a9fc75e9adddc79afcedf4a51dd8c207-2560x1395.jpg") },
  { client: "Supergut", title: "Harnessing the power of the gut", slug: "supergut", media: image("e41102101ae8b72fa82e3392395423df19cb13d2-2560x1439.jpg") },
  { client: "r.Potential", title: "Pushing human potential through AI", slug: "r-potential", media: image("0a05cc60ad914a7840ae605a672a2fa485d54fe6-2560x1395.jpg") },
  { client: "NodeKit", title: "Unchaining the blockchain", slug: "nodekit", media: video("122e74e931804bb1b8e4fc54098e851274584238.mp4", "c4d99ef3ed986483d51b0f5754faecf519bc8bca-2952x1678.jpg") },
  { client: "Dorne", title: "Embodying paradise", slug: "dorne", media: video("a0bb04ded124412ffd75d85f3a2711c837f6f7b4.mp4", "f9d7beda3cf97dd3c636dce6a0987ec6d4476a35-1392x1080.jpg") },
  { client: "Piñata Pay", title: "Reimagining rent", slug: "pinata-pay", media: video("56b69170bdc186e987a0ac4335905156fecdfc10.mp4", "84500601e8c963da064c6d73c14d8b4ef262b11e-1920x1080.jpg") },
  { client: "Smith Chason", title: "Engaging the future of healthcare", slug: "smith-chason", media: video("018cfc7a51c01f1f0c3b91d5e4236cdacc4dfaf1.mp4", "88191150fb2715ae6a7147f77ba24a713ef46717-1920x1080.jpg") },
  { client: "Wormhole", title: "Invigorating a brand for innovation", slug: "wormhole", media: video("ad5e3ce399de876a393d3f098c8769c3177b9602.mp4", "350aa8dd8ade55b658ef8e0169126385b7ef9f1a-1920x1080.jpg") },
  { client: "Senté", title: "Sharing is (skin)caring", slug: "sente", media: image("16ea6692cf907bb0634611935c7aa5480aa36881-1660x1020.png") },
  { client: "OnTrac", title: "Delivering what matters", slug: "ontrac", media: image("5c4cd61bc655424561545912bbf57432e7c613ea-1920x1081.png") },
  { client: "Movement Labs", title: "Breaking barriers to build together", slug: "movement-labs", media: video("17e6241252ea1443e3900f68e1b24a0aca4e73d9.mp4", "a184ec6d63caa843de784b1a6ba60caf301a81d3-1920x1080.jpg") },
  { client: "Nillion", title: "Showcasing innovation and information", slug: "nillion", media: video("6a178c2a0837e03d39264298948ab8506d576803.mp4", "669a25d2853f0ff91c342a4436f85899119b7f57-1920x1080.jpg") },
  { client: "ŌUSHQ", title: "Bringing a brand to life", slug: "oushq", media: video("676f8c50431114153ebfb73c1733949c4ddebd1f.mp4", "657deeb7cbbf017fe2bfae6cc4e150b22628f03e-1600x1066.jpg") },
  { client: "Voyant", title: "Putting the future in sight", slug: "voyant", media: video("00d5c3cc1e97defcb92fe23d0cae6315ebc1f037.mp4", "192b12ea1c0aa2337302d2022fc009a1e4551cf5-1920x1080.jpg") },
  { client: "immi", title: "Creating in character", slug: "immi", media: video("0cbe7f70b188707dbb84c231ffa8982e4a491081.mp4", "3fb121c1c902dd021c2eef7ed59aac4575a9ef02-1920x1080.jpg") },
  { client: "Libra", title: "Tipping the balance towards a cure", slug: "libra", media: video("e535aa1b5e5b08f094e872399ddbc7e32b4ece51.mp4", "22db6aaf7e619ec5f1a2c0421a9a75c5e97cb207-1920x1080.jpg") },
  { client: "Fare Forward", title: "Finding a new path forward", slug: "fare-forward", media: video("1a57568ad779075fe7188584bfc7c8f75f0edac3.mp4", "f05541517b344ec8bd9f4441df232cf6b00753d9-1920x1080.jpg") },
  { client: "Token Tourney", title: "Elevating sports fandom through NFTs", slug: "token-tourney", media: video("9e6518858cb19c2b1007d5e4808084d4ce8d1083.mp4", "85c4f55a3b39ff845e948944dee168714384e1ae-1920x1080.jpg") },
  { client: "Piñata", title: "Making rent more rewarding", slug: "pinata", media: video("78457b2458dbcb49aef7294ba5d4143802eced23.mp4", "dadce7c00376ac4292f0acb324a47a351f45cea4-1920x1080.jpg") },
  { client: "Resonate", title: "Redefining the art of meditation", slug: "resonate", media: video("acdd4bc568efc975cd6193a67f15175563616688.mp4", "fb4d3d7b9b601048484021349b44c691fdbcf87d-1918x1080.jpg") },
  { client: "PULL Systems", title: "Powering the future of creator commerce", slug: "pull-systems", media: video("a8516481153bbc1304d7096bd130d6650ff69f1d.mp4", "613c260173fd651a9c589975c0fa9705253e192d-1920x1080.jpg") },
  { client: "Unreal Estate", title: "Igniting the real estate revolution", slug: "unreal-estate", media: video("092d683f615df4a3dccd416bdec0bf2bd50f7ffc.mp4", "c41e5ded5b9b5f7d6ce819cd5154b9fd8efc7c21-1920x1080.jpg") },
  { client: "Flowcarbon", title: "Opening the carbon market to everyone", slug: "flowcarbon", media: video("fb7434b626edf7694197ab6e1def103c9d19aae1.mp4", "56f48d09747db1f6e36d80d2a0683984e44774ab-1920x1080.jpg") },
  { client: "Martha Stoumen", title: "Blazing new trails in natural wine", slug: "martha-stoumen", media: image("004f1a52dc874f343f861c1c897577f7fc507a77-2560x1440.jpg") },
  { client: "DSG", title: "Finding a new path forward", slug: "dsg", media: video("a5f0000f8391d13d25e3b949ed32f1946c472a2c.mp4", "4aa0a6ab84991559a67b60e7ccc1bdb6f77692f7-2944x1656.png") },
];

export const SNAPSHOTS: SnapshotCard[] = [
  { client: "Coral Vita", media: image("3e5ddd91eac6e7dbf28d26fbd7022344466e0af6-1742x1404.gif") },
  { client: "Amp", media: video("1ce337d9c1966aae1f78f631f1f2543babe5d331.mp4", "046cc08298557308c81d88c49a1994e6829f10ce-966x642.jpg") },
  { client: "Hoka", media: image("80d9f3941a1abd83edd93688c4090fbb1751678d-726x482.jpg") },
  { client: "CBRE", media: video("0e9590d4939651e6845a69947c99c2a71aec3945.mp4", "a216c20e733bb919785a1f518aa9f823adc430b4-878x720.jpg") },
  { client: "Roche", media: image("a25f1095a1fb749cf592220dc71311b3fdb2da3f-2730x2238.png") },
  { client: "Visa", media: image("b8168b39648b69a6464c5a52850b2ea913c5e5fb-2560x2099.png") },
  { client: "Salesforce x Ferrari", media: video("839eebd9b4dc507a37b7fbbaaa8bd958dc64205b.mp4", "e8ad523734efb9cb4d17abd2898d0534e167c1c3-1318x720.jpg") },
  { client: "Coco Club", media: video("c5dfa263d716b9b524e39675079d6003b17497f0.mp4", "60697c0a9219f64047599772b1aa6fd30da4d042-932x720.jpg") },
  { client: "Call of Duty", media: video("b817c57346e1e3ed485a39398dc25a10cbbc52ad.mp4", "288df65fdb3c89d86f91dec3b071bc35f9ff91af-1472x748.jpg") },
  { client: "Slack Lists", media: image("a44755d28550994a1517f06a6ff10392f6e8fea2-910x746.jpg") },
  { client: "Smith", media: image("bd1443424168a6f5a40d2656af35263d56c571a2-800x620.png") },
  { client: "Audi", media: video("def46c97ac67938dc9e6cab04f25f2d15fb228cb.mp4", "3d67c21b0c7e29778d756e432077cc830295fa94-910x720.jpg") },
  { client: "New York New Wave", media: video("3be714db2995aed24c3d85d08ec40b1e055e0d8b.mp4", "a901cc398eb59a82d105cf5942b84f07a72f94f7-1724x1080.jpg") },
  { client: "Under Pressure", media: image("af6b1da18daf31a6e27fd56297fb2ede979c3406-800x620.png") },
  { client: "BMW", media: video("2eef776dcbaaad5bde1adcb9e1273fadfd87a343.mp4", "99c21c5f3a09593dcd05f35c58780c5658b2d979-930x720.jpg") },
  { client: "Unikrn", media: video("5a65f8bc99acc67e45e97e6d9e93963f18d53ea2.mp4", "a6b57c78780c00361789c3a44c03d7f7682f67ac-932x720.jpg") },
  { client: "Metajamz", media: video("35a463e28234a298db5abdcbf3cd4c77662fc9e3.mp4", "a400aa96e6cdef95f9f97c893a622dcb723f63d9-720x720.jpg") },
  { client: "Victoria's Secret", media: image("4efe834cd7c4d6e1dd25acf588c3e6668589746d-1600x1239.png") },
  { client: "Ricari Studios", media: video("5e42ea78bbfcabdd0d8a3ff071a1e5742d8b5d69.mp4", "2a2f024b00078ea23ddbef2d7cf7bba96b4dd28a-932x720.jpg") },
  { client: "Mith", media: video("313aa365285c117d63544c614594cfefe9616634.mp4", "a4c176c395a62c8610fc9884acf2452a8b0cf083-1396x1080.jpg") },
  { client: "AMGI", media: image("d6c0eda6c74d5919506d260db88d2a611308359b-800x620.webp") },
  { client: "Samsung", media: image("9fc7534ec146fe4e98fbb02c7a3f86acc07d7a49-800x620.png") },
  { client: "Portico", media: video("4d4a9587c0cb49aff916c52b7da6af83d9a05885.mp4", "3df476683a181eaa7f6df3cc905543822a514775-720x720.jpg") },
  { client: "GoodToday", media: video("e5d842420e2e51a199041f67e73622fa0271df16.mp4", "d51e62653c1388154d36a5f68d07028f52d3ba05-698x540.jpg") },
  { client: "Albertsons", media: video("bccb3b9f22b5b4333dc8cd7d6dd212ad8990ee70.mp4", "0c7e97bd395f56bf9a70ed19d73080db3e05e34e-1280x720.jpg") },
  { client: "VibeCap", media: video("68a541ca5de8733575b7f23d9815edcdd9d763a5.mp4", "e4f25d0c140f94c7f9c432a408bc43eca0c7aa01-1080x1080.jpg") },
  { client: "Arteli", media: image("0831c519c434598b38bf42d9b3fefc4370a1260e-800x620.png") },
  { client: "Cryptoys", media: video("94c930e439160d00856b356e0e92ef95fcd21150.mp4", "0fde577207e6450290befbb12af7fbd311424273-930x720.jpg") },
  { client: "Inevitable", media: video("4c1ee005ca73e1c0b7f7800eefeaed2b2fd9f32f.mp4", "0459a86f4a0007fdfa626ec5ff857b4f2ce87a1b-696x540.jpg") },
  { client: "US Soccer Federation", media: video("ee64823558594d78153db1cea5a158e63826b680.mp4", "a87013a9abd6798584c670e3f33fba944ea1a7ac-928x720.jpg") },
  { client: "Alpha", media: video("9f9e1c4cd54b276ab3bfce7d4fb37c72756caf30.mp4", "333aecdff1dda71f744b37f297f6413414228dc0-720x720.jpg") },
  { client: "Aeyr", media: image("c69af61373cf2f997fc3a5357315ba22f28d903d-800x620.png") },
  { client: "Budweiser", media: image("7353cd2c30edbcc9aa4d9d70bd576fa0f8a3e00b-800x620.png") },
  { client: "Omnigen", media: image("08ada8ffb4494d5240eb9668e5860ca2543ec1b7-800x620.png") },
  { client: "Evermore", media: image("69d8a442a205b6a429354bc638b3b5166b5526d3-800x620.png") },
  { client: "KALO", media: video("dc490a728053376e4c5df8b816354a90870336ae.mp4", "52f1d6aa30f92b10c93ba96e915a388dc6e4b2a4-932x720.jpg") },
  { client: "Frontrange", media: video("de68017d8b1b367bd92ac6323cfdbb89623c6e5d.mp4", "f704a5265925971684780d624a0efb73412383b2-930x720.jpg") },
  { client: "Repose", media: image("fdbd19e8326375b9ed250831f63502c0bdc37286-800x620.png") },
  { client: "Howdy", media: video("3902a27736295a2d5ee04bcbb3449a26c817eee7.mp4", "a950e5b2b9c1901a0c3795ae91df4c1d6a624d6f-698x540.jpg") },
  { client: "Equinox", media: video("8b4f14d23a70ba58524c732e367d4098f5c12e83.mp4", "f34b65ab9453fb0063258e9f9e6214077cccd8fe-720x720.jpg") },
  { client: "Synergis", media: video("6f153976f7114c1b2ce75f5c2bb51be41909f406.mp4", "29012aa6fc0d56baf7e1f65ac7542e7ca849a9d6-930x720.jpg") },
  { client: "CapM", media: image("b9fff98c0e1441db4a770785e6bef33cfdd7582e-800x620.png") },
  { client: "Motient", media: image("d533e0448dc20ccd725995805fdc6e3342874c4d-800x620.png") },
  { client: "Neuron23", media: image("22df51bf39ce0138dafd38d6d1c04d2c87a82dc7-800x620.png") },
];

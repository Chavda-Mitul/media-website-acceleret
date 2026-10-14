// Footer stickers (hand-drawn illustrations) with their natural pixel sizes.
// Placeholder artwork from the reference site — replace with your own.
const sticker = (hash: string, width: number, height: number) => ({
  src: `/assets/images/stickers/${hash}.png`,
  width,
  height,
});

export type Sticker = ReturnType<typeof sticker>;

export const STICKERS: Sticker[] = [
  sticker("d33ca1387767e924a38a9dc6d00824529402113a", 787, 1054),
  sticker("f659f5478854ea7b9a41dcd8ad0681a236bf2a15", 1474, 783),
  sticker("2615df2c2231cb28d8153a733a679bd382fc599e", 738, 1200),
  sticker("01911f21ede6575d1689afdee53b8e333d025045", 953, 708),
  sticker("0476628518ddf9cc6d7b93315091638cfccc5b10", 1229, 877),
  sticker("0eb66a55d26440afa4fc58c97dfd5745f3b95a58", 742, 503),
  sticker("136854d136b29ca4b997096fc063d3e8175ca6ef", 1100, 1122),
  sticker("1faa47f2fad9abb2cda3759ee28ab779a99a1ffd", 1762, 862),
  sticker("20f217e544b318e137dbd5179e7be3eb3649df25", 522, 523),
  sticker("270c7d3e4875ca1f5468477f6f7f010cfcc94931", 657, 1004),
  sticker("38e2221993f5f64971c7a9e88e9219e78c9c6760", 1222, 683),
  sticker("392eadeb3010f8bfda9db50bf1161cf27d675076", 567, 735),
  sticker("59ec095ae3660cd712c229f427bc7f33228f0713", 625, 899),
  sticker("65c80773a8053da17cbde5d9bbf60b508e29599b", 727, 891),
  sticker("866a0cefab371b1163259a0a69ebfe2427d1886c", 1087, 571),
  sticker("a55c952661750037f55559a9eec512204f604df7", 975, 898),
  sticker("ab54f627052b83314dd6aa594fe4c607e5887dfa", 731, 933),
  sticker("b400530e941ca8fc27af847d18a1591160d98d83", 505, 560),
  sticker("c31a80f502938680a3c88cb837950b1763fa10da", 1125, 1002),
  sticker("c9051e8e285d589c1f3a9ce6c6f12a44fbc4873b", 897, 392),
  sticker("e0354ef9d422b6598d91bce31c9227a2985f7037", 667, 1098),
  sticker("f84a4b6c476de95519acb000e4cb117231e90154", 839, 945),
  sticker("f8d84aa530e12d80ba94a99166eecaf9f76f009c", 844, 704),
];

/** Illustration used in the navbar Contact card. */
export const CONTACT_ILLUSTRATION = STICKERS[0];

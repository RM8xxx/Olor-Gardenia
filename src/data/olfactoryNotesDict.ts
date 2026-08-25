/**
 * Comprehensive dictionary of olfactory notes and perfume ingredients with
 * reference pictures, clear definitions of what each ingredient is in perfumery,
 * its visual aspect, and its sensory character.
 */

export interface OlfactoryNoteInfo {
  name: string;
  category: string;
  image: string;
  whatIsIt: string;
  visualDescription: string;
}

export const OLFACTORY_NOTES_DICTIONARY: Record<string, OlfactoryNoteInfo> = {
  // CÍTTRICOS
  'bergamota': {
    name: 'Bergamota',
    category: 'Cítrica / Fresca',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Fruto cítrico aromático de piel rugosa verde y amarilla, similar a una pequeña naranja amarga o lima.',
    whatIsIt: 'Es un cítrico exclusivo cultivado casi en su totalidad en Calabria (Italia). En perfumería no se consume su pulpa, sino que se extrae el aceite esencial de su cáscara. Es considerado "el rey de las notas de salida" por otorgar un brillo chispeante, fresco, elegante y ligeramente amargo que abre los mejores perfumes del mundo.'
  },
  'limon': {
    name: 'Limón de Sicilia',
    category: 'Cítrica',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Fruto cítrico amarillo brillante de cáscara porosa y pulpa jugosa.',
    whatIsIt: 'Esencia pura extraída por prensado en frío de las cáscaras de limón. En perfumería fina aporta una explosión de energía luminosa, ácida y ultra limpia que despierta el olfato de forma inmediata.'
  },
  'mandarina': {
    name: 'Mandarina Italiana',
    category: 'Cítrica / Frutal',
    image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Cítrico esférico anaranjado de cáscara fina y gajos dulces aterciopelados.',
    whatIsIt: 'Es una nota cítrica mucho más dulce, jugosa y suave que el limón. Se utiliza en perfumería para dar un toque alegre, solar y radiante con un matiz azucarado natural que no resulta punzante.'
  },
  'pomelo': {
    name: 'Pomelo / Toronja',
    category: 'Cítrica',
    image: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Fruto cítrico grande de pulpa rosa o rubí y cáscara gruesa con aceites esenciales efervescentes.',
    whatIsIt: 'En el mundo de los perfumes es un cítrico contemporáneo, deportivo y astringente. Otorga una apertura amarga y efervescente muy codiciada en fragancias modernas masculinas y unisex como Bleu de Chanel o Terre d\'Hermès.'
  },
  'toronja': {
    name: 'Toronja / Pomelo Rosa',
    category: 'Cítrica',
    image: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Fruto cítrico grande de pulpa rosada y cáscara gruesa rica en aceites aromáticos.',
    whatIsIt: 'Aporta una sensación cítrica efervescente, amarga y vigorizante. Es la clave para darle frescura moderna y atlética a la salida del perfume.'
  },
  'naranja': {
    name: 'Naranja Dulce / Bigarade',
    category: 'Cítrica',
    image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Fruto esférico de color naranja vivo con cáscara rica en glándulas de aceite fragante.',
    whatIsIt: 'Ingrediente natural obtenido de la cáscara del naranjo. Brinda un aroma cálido, jugoso y optimista, balanceando notas más densas como maderas o especias.'
  },
  'neroli': {
    name: 'Neroli',
    category: 'Floral Cítrica',
    image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Pequeñas flores blancas estrelladas del árbol de naranjo amargo (Citrus aurantium).',
    whatIsIt: 'Es el aceite esencial extraído por destilación al vapor de las flores frescas del naranjo amargo. Representa el lujo clásico mediterráneo: huele a flores blancas limpias con un marcado toque cítrico y verde cristalino.'
  },
  'flor de azahar': {
    name: 'Flor de Azahar del Naranjo',
    category: 'Floral Blanca',
    image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Flor blanca cerosa intensamente perfumada de las ramas del naranjo.',
    whatIsIt: 'A diferencia del Neroli (destilado), el absoluto de flor de azahar se obtiene por extracción y entrega un aroma mucho más opulento, dulce, meloso y sensual, pilar de perfumes seductores femeninos y masculinos.'
  },

  // MADERAS
  'cedro': {
    name: 'Cedro (Cedarwood)',
    category: 'Amaderada Noble',
    image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Madera densa y aromática de color pardo rojizo con vetas naturales de cedro de Virginia o del Atlas.',
    whatIsIt: 'Es una de las maderas más emblemáticas de la perfumería. Su aceite huele a madera seca, noble y limpia, similar a las virutas de un lápiz fino recién afilado. Funciona como la columna vertebral que sostiene la estructura del perfume en la piel.'
  },
  'sandalo': {
    name: 'Sándalo (Sandalwood)',
    category: 'Amaderada Cremosa',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Leño aromático sagrado de tono dorado claro proveniente del árbol Santalum album.',
    whatIsIt: 'Es una madera preciosa venerada en Oriente por su carácter cremoso, lechoso, cálido y aterciopelado. En perfumería otorga una sensación de confort adictivo y sensualidad suave, prolongando la estela durante muchas horas.'
  },
  'oud': {
    name: 'Oud (Madera de Agar)',
    category: 'Madera Preciosa / Oriental',
    image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Madera oscura y densa impregnada de una resina aromática protectora de árboles de Aquilaria milenarios.',
    whatIsIt: 'Conocido como "el oro líquido de la perfumería" y uno de los ingredientes más caros del planeta (puede costar más que el oro por gramo). Nace cuando el árbol de Aquilaria se defiende de un hongo produciendo una resina oscura ultrapotente. Su aroma es ahumado, balsámico, profundo, animálico y de un lujo misterioso.'
  },
  'madera de agar': {
    name: 'Madera de Agar (Oud)',
    category: 'Madera Preciosa / Oriental',
    image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Madera sagrada resinosa y petrificada de color ébano.',
    whatIsIt: 'Ingrediente supremo de la perfumería árabe y nicho. Confiere un carácter imponente, misterioso, ahumado y una fijación incomparable.'
  },
  'vetiver': {
    name: 'Vetiver de Haití',
    category: 'Amaderada / Terrosa',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Red subterránea de raíces aromáticas y fibrosas de la planta tropical Chrysopogon zizanioides.',
    whatIsIt: 'No es una madera sino las raíces de una hierba tropical que crece en Haití e Indonesia. En perfumería huele a tierra mojada noble, humo elegante, raíces verdes y pomelo amargo. Es sinónimo indiscutible de sobriedad y distinción masculina y unisex.'
  },
  'pachuli': {
    name: 'Pachulí (Patchouli)',
    category: 'Amaderada / Terrosa',
    image: 'https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Hojas verdes aterciopeladas de un arbusto tropical de Indonesia que se secan y fermentan antes de destilarse.',
    whatIsIt: 'Es una hierba aromática originaria de Asia cuyas hojas se dejan secar al sol para luego extraer su legendario aceite esencial. En perfumería es el alma de los perfumes Chipre y Orientales: huele a bosque húmedo, cacao amargo, tierra rica y madera profunda. Otorga una de las mejores fijaciones del mundo aromático.'
  },
  'patchouli': {
    name: 'Patchouli (Pachulí)',
    category: 'Amaderada / Terrosa',
    image: 'https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Hojas aromáticas fermentadas de la planta Pogostemon cablin.',
    whatIsIt: 'Ingrediente clave que aporta profundidad terrosa, fijación prolongada y un toque amaderado sensual similar al chocolate oscuro y la tierra fértil.'
  },
  'madera de gaiac': {
    name: 'Madera de Guayaco (Palo Santo Sudamericano)',
    category: 'Amaderada Ahumada',
    image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Madera densa sudamericana rica en resinas balsámicas y alquitranadas.',
    whatIsIt: 'Madera noble del árbol Bulnesia sarmientoi. Se destila para obtener un aroma con cuerpo de humo suave, notas de chimenea invernal noble, cuero y violetas balsámicas.'
  },
  'guayaco': {
    name: 'Madera de Guayaco',
    category: 'Amaderada Ahumada',
    image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Madera oscura aromática y resinosa de bosques sudamericanos.',
    whatIsIt: 'Aporta una textura ahumada, densa y sumamente acogedora a los fondos de las fragancias invernales y de noche.'
  },

  // FLORALES
  'rosa': {
    name: 'Rosa de Damasco / Rosa de Grasse',
    category: 'Floral Sublime',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Pétalos aterciopelados rosados y carmesí recolectados a mano antes del amanecer en Turquía, Bulgaria o Francia.',
    whatIsIt: 'Es la "reina de las flores" en perfumería. Se requieren aproximadamente 4 toneladas de pétalos frescos para obtener 1 kilo de aceite esencial. Huele a pétalo sedoso, rocío de la mañana, toques de miel suave y una elegancia atemporal inconfundible.'
  },
  'jazmin': {
    name: 'Jazmín Sambac / Grandiflorum',
    category: 'Floral Blanca Narcótica',
    image: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Delicadas flores blancas recolectadas exclusivamente durante la noche cuando su aroma alcanza su punto máximo.',
    whatIsIt: 'El jazmín es el "rey de las flores" y el pilar de la seducción olfativa. Su aroma es radiante, dulce, embriagador, cálido y carnal. Casi no existe perfume icónico femenino o unisex que no cuente con una gota de jazmín.'
  },
  'lavanda': {
    name: 'Lavanda de Provenza',
    category: 'Aromática / Herbal Fougère',
    image: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Espigas florales de color violeta azulado cultivadas en los valles soleados del sur de Francia.',
    whatIsIt: 'Es el pilar de la familia "Fougère" (perfumes estilo barbería fina). En perfumería aporta un aroma fresco, limpio, floral-herbal y relajante que evoca una pulcritud impecable y dinamismo masculino clásico.'
  },
  'iris': {
    name: 'Iris (Rizoma de Orris)',
    category: 'Floral Atalcada / Lujo',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Raíces subterráneas (rizomas) de la flor de Iris que se secan y envejecen en almacenes durante 3 a 5 años.',
    whatIsIt: 'Es uno de los ingredientes más costosos de la perfumería mundial. No se usa la flor, sino el rizoma secado por años hasta pulverizarse en "mantequilla de orris". Otorga un acabado atalcado (polvoso), aristocrático, con recuerdos a maquillaje fino, gamuza suave y madera pura (famoso en Dior Homme).'
  },
  'violeta': {
    name: 'Hojas y Flor de Violeta',
    category: 'Floral Verde / Atalcada',
    image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Pequeñas flores silvestres moradas y hojas verdes en forma de corazón.',
    whatIsIt: 'En perfumes, las hojas de violeta aportan un frescor verde, acuoso y metálico moderno (estilo Fahrenheit), mientras que la flor aporta una dulzura suave y atalcada.'
  },
  'tuberosa': {
    name: 'Tuberosa (Nardo)',
    category: 'Floral Blanca Carnal',
    image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Flor nocturna de pétalos blancos gruesos y carnosos originaria de México e India.',
    whatIsIt: 'Es una de las flores más potentes y carnales de la perfumería. Huele a crema densa de flores blancas, mantequilla dulce y magnetismo nocturno. Es la nota estelar de perfumes audaces e inolvidables.'
  },
  'nardo': {
    name: 'Nardo (Tuberosa)',
    category: 'Floral Blanca Carnal',
    image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Flor blanca cerosa de floración nocturna con intensa fragancia balsámica.',
    whatIsIt: 'Aporta una feminidad y voluptuosidad exuberante que hipnotiza el ambiente.'
  },
  'ylang-ylang': {
    name: 'Ylang-Ylang',
    category: 'Floral Exótica Tropical',
    image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Flor amarilla de pétalos largos y colgantes del árbol Cananga odorata en Madagascar e Islas Comoras.',
    whatIsIt: 'Conocida como "la flor de las flores". En perfumería fina aporta un aroma dulce, exótico, con recuerdos a jazmín, plátano maduro y crema solar dorada, famosa en clásicos como Chanel N°5.'
  },
  'peonia': {
    name: 'Peonía',
    category: 'Floral Fresca Primaveral',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Gran flor exuberante de múltiples capas de pétalos finos de color rosa pastel y blanco.',
    whatIsIt: 'Es una nota floral aérea, acuática, juvenil y fresca que evoca la primavera y la delicadeza sin ser empalagosa.'
  },

  // GOURMAND / DULCES
  'vainilla': {
    name: 'Vainilla Bourbon de Madagascar',
    category: 'Gourmand / Oriental',
    image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Vainas delgadas y brillantes de color café ébano curadas al sol, pertenecientes a una orquídea tropical.',
    whatIsIt: 'El afrodisíaco por excelencia de la perfumería. Proviene de los frutos secados y curados de la orquídea de vainilla. Su aroma en perfumes de alta concentración no es de simple dulce, sino balsámico, cálido, profundo, licoroso, reconfortante y de una sensualidad adictiva.'
  },
  'haba tonka': {
    name: 'Haba Tonka (Tonka Bean)',
    category: 'Gourmand Especiada',
    image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Semilla arrugada y oscura del árbol Dipteryx odorata en la cuenca del Amazonas.',
    whatIsIt: 'Es una semilla sudamericana rica en cumarina natural. En el perfume se siente como una fusión deliciosa entre vainilla tostada, almendra cremosa, canela suave, tabaco rubio y heno dulce. Es el ingrediente secreto detrás de los perfumes seductores para citas y vida nocturna.'
  },
  'tonka': {
    name: 'Haba Tonka',
    category: 'Gourmand Especiada',
    image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Semilla aromática amazónica arrugada de tono marrón oscuro.',
    whatIsIt: 'Otorga una cremosidad cálida y un toque dulce almendrado que hace el aroma irresistible en la piel.'
  },
  'caramelo': {
    name: 'Caramelo / Azúcar Tostado',
    category: 'Gourmand Dulce',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Dulce dorado espeso y fundido obtenido de la cocción lenta de azúcares y mantequilla.',
    whatIsIt: 'Es una nota dulce creada para generar el llamado "efecto goloso o postre". Aporta una textura envolvente, festiva y reconfortante que atrae elogios al instante.'
  },
  'cafe': {
    name: 'Café Tostado (Coffee Beans)',
    category: 'Gourmand Oscuro',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Granos de café de tueste oscuro recién molidos, brillantes por sus aceites naturales.',
    whatIsIt: 'En perfumería se usa para crear un contraste eléctrico: rompe con lo excesivamente dulce aportando un toque oscuro, energizante, licoroso y misterioso (como en Black Opium o Halloween Man X).'
  },
  'chocolate': {
    name: 'Cacao / Chocolate Oscuro',
    category: 'Gourmand',
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Semillas de cacao secadas y fermentadas, o tableta de cacao puro con rica manteca aromática.',
    whatIsIt: 'Aporta una calidez densa, ligeramente amarga y aterciopelada que abraza la piel durante horas de noche.'
  },
  'almendra': {
    name: 'Almendra Amarga',
    category: 'Gourmand Refinada',
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Fruto seco de cáscara dura con interior blanco lechoso rico en benzaldehído aromático.',
    whatIsIt: 'Huele a mazapán fino, crema sedosa y un toque de licor de amaretto. Es la firma olfativa de fragancias de lujo como Pegasus de Parfums de Marly o Hypnotic Poison.'
  },
  'miel': {
    name: 'Miel Dorada',
    category: 'Gourmand / Animal',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Néctar espeso y brillante recolectado por abejas de flores silvestres.',
    whatIsIt: 'Aporta una textura densa, dulce, licorosa y ligeramente salvaje que funde las flores con las maderas del fondo.'
  },

  // ESPECIAS
  'canela': {
    name: 'Canela de Ceilán',
    category: 'Especiada Cálida',
    image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Rollos de corteza interior de color canela secados naturalmente al sol.',
    whatIsIt: 'Es una de las especias más cálidas del mundo. En los perfumes eleva la temperatura de la composición haciéndola picante, dulce, acogedora y perfecta para otoño, invierno y citas.'
  },
  'cardamomo': {
    name: 'Cardamomo de Guatemala',
    category: 'Especiada Fresca',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Vainas verdes aromáticas que contienen pequeñas semillas negras intensamente perfumadas.',
    whatIsIt: 'Conocido en perfumería como "la reina de las especias frías". Su aroma es una mezcla fascinante de cítricos, menta, resina y picante elegante. Es el ingrediente secreto detrás de la seducción de La Nuit de L\'Homme de YSL.'
  },
  'pimienta negra': {
    name: 'Pimienta Negra de Madagascar',
    category: 'Especiada Chispeante',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Granos de pimienta enteros secos, negros y rugosos con aceite esencial vigorizante.',
    whatIsIt: 'Le da un "latigazo de energía" al perfume. Aporta un picor seco, amaderado y energizante que despierta la fragancia desde el primer segundo.'
  },
  'pimienta rosa': {
    name: 'Pimienta Rosa (Pink Pepper)',
    category: 'Especiada Frutal / Floral',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Pequeñas bayas rojizas y quebradizas de un árbol sudamericano (Schinus molle).',
    whatIsIt: 'No pica como la pimienta negra: es fresca, floral, ligeramente dulce y recuerda a frutos rojos recién cortados. Es muy utilizada en perfumes modernos por su brillo radiante.'
  },
  'azafran': {
    name: 'Azafrán Rojo (Saffron)',
    category: 'Especiada / Cuero Lujoso',
    image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Finos estigmas de color rojo fuego cosechados a mano de la flor Crocus sativus.',
    whatIsIt: 'Llamado "el oro rojo" por ser la especia más costosa del mundo. En perfumería fina aporta un aroma metálico, seco, con facetas de cuero suave, heno y lujo oriental (la firma inconfundible de Baccarat Rouge 540).'
  },
  'nuez moscada': {
    name: 'Nuez Moscada',
    category: 'Especiada Amaderada',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Semilla leñosa ovalada rallada finamente para liberar aceites aromáticos.',
    whatIsIt: 'Aporta una calidez masculina clásica, terrosa y aromática que equilibra flores y cítricos.'
  },
  'jengibre': {
    name: 'Jengibre Fresco',
    category: 'Especiada Cítrica Eléctrica',
    image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Rizoma nudoso de piel beige con pulpa amarilla jugosa y picante.',
    whatIsIt: 'Brinda una vibración cítrica chispeante y picante que llena de dinamismo cualquier fragancia juvenil o de uso diario.'
  },

  // ÁMBAR / ORIENTALES / FIJADORES
  'ambar': {
    name: 'Ámbar (Acorde Ambarino)',
    category: 'Oriental / Resinosa',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Gemas de resina fósil vegetal translúcida de color miel, caramelo y coñac dorado.',
    whatIsIt: 'En perfumería, el ámbar es un acorde magistral creado con resinas preciosas (benjuí, ládano y vainilla). Su aroma es cálido, dorado, envolvente, dulce y sensual. Es el corazón de los perfumes orientales y el secreto para que un perfume perdure días enteros.'
  },
  'ambroxan': {
    name: 'Ambroxan (Ámbar Gris Moderno)',
    category: 'Ambarina Limpia / Mineral',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Molécula biotecnológica pura sintetizada de la salvia esclarea con aspecto de cristales blancos.',
    whatIsIt: 'Es la molécula estrella de los perfumes más vendidos del siglo XXI (como Dior Sauvage, Creed Aventus y Baccarat Rouge). Proporciona un aroma limpio, ambarino, mineral, salino y de efecto "piel radiante". Tiene una proyección descomunal y se fija a la piel y a la ropa como un imán.'
  },
  'ambar gris': {
    name: 'Ámbar Gris Marino',
    category: 'Oriental Marina / Animal',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Sustancia cerosa natural curada por el sol y el agua salada del océano durante décadas.',
    whatIsIt: 'El fijador más legendario de la historia de la perfumería. Otorga un fondo salino, cálido y envolvente que funde todos los ingredientes sobre la piel humana.'
  },
  'incienso': {
    name: 'Incienso / Olíbano de Omán',
    category: 'Resina Mística Oriental',
    image: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Lágrimas de resina gomosa extraídas de la corteza del árbol sagrado Boswellia en el desierto.',
    whatIsIt: 'Resina sagrada utilizada desde tiempos del antiguo Egipto. En el perfume aporta un humo balsámico refinado, místico y con una punta cítrica que transmite serenidad y pura sofisticación.'
  },
  'olibano': {
    name: 'Olíbano (Incienso Sagrado)',
    category: 'Resina Mística',
    image: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Resina aromática natural recolectada en forma de lágrimas doradas del árbol Boswellia.',
    whatIsIt: 'Aporta un halo ahumado, limpio y profundamente elegante al fondo del perfume.'
  },
  'benjui': {
    name: 'Benjuí de Siam',
    category: 'Balsámica Dulce',
    image: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Resina densa y dorada del árbol Styrax con aroma natural avainillado.',
    whatIsIt: 'Fijador de altísimo valor que suaviza cualquier nota punzante aportando dulzura de caramelo, vainilla y canela.'
  },

  // ALMIZCLES / CUERO / ACUÁTICOS
  'almizcle': {
    name: 'Almizcle Blanco (White Musk)',
    category: 'Almizclada / Segunda Piel',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Acorde aromático contemporáneo limpio, sedoso y algodonoso.',
    whatIsIt: 'En la perfumería actual se utilizan almizcles limpios sintéticos y 100% éticos. Su aroma evoca sábanas de algodón blanco recién lavadas, piel tibia y pureza. Es el ingrediente que hace que un perfume se sienta íntimo, acogedor y que dure todo el día.'
  },
  'musk': {
    name: 'Musk / Almizcle',
    category: 'Almizclada / Segunda Piel',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Molécula fina de perfumería que evoca la suavidad del algodón y la piel fresca.',
    whatIsIt: 'Fijador universal que crea el efecto de "segunda piel", prolongando la vida del perfume de forma limpia y seductora.'
  },
  'cuero': {
    name: 'Cuero / Cuero Ruso',
    category: 'Cuero & Piel Fina',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Piel fina curtida, guantes de ante y chaquetas de cuero aromático de alta costura.',
    whatIsIt: 'Acorde magistral creado con abedul, cade, azafrán y resinas para recrear el olor de las chaquetas de piel y artículos de talabartería fina. Denota personalidad fuerte, elegancia rebelde y un carácter imponente (como en Ombré Leather).'
  },
  'gamuza': {
    name: 'Gamuza (Suede)',
    category: 'Cuero Aterciopelado',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Cuero aterciopelado suave al tacto y flexible.',
    whatIsIt: 'Una interpretación más suave, empolvada y sedosa del cuero, perfecta para fragancias de lujo sutil.'
  },
  'notas marinas': {
    name: 'Notas Marinas / Brisa Oceánica (Calone)',
    category: 'Acuática / Marina',
    image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Olas rompientes en la orilla del mar, agua cristalina y brisa marina salina.',
    whatIsIt: 'Acorde acuático creado para capturar la inmensidad del océano, la sal marina y el aire fresco de la costa. Otorga una sensación de libertad absoluta y frescura veraniega insuperable.'
  },
  'notas acuaticas': {
    name: 'Notas Acuáticas / Ozónicas',
    category: 'Acuática',
    image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Gotas de agua pura, rocío de cascada y aire puro de lluvia.',
    whatIsIt: 'Brinda transparencia, pureza y ligereza refrescante para climas cálidos y uso diario.'
  },
  'pina': {
    name: 'Piña Tropical (Pineapple)',
    category: 'Frutal Exótica',
    image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Fruta tropical madura de cáscara con coronilla verde y pulpa jugosa dorada.',
    whatIsIt: 'Es el acorde icónico de la perfumería nicho contemporánea (el alma de Creed Aventus). Aporta una jugosidad dulce, ácida y ligeramente ahumada que genera cumplidos inmediatos.'
  },
  'cereza': {
    name: 'Cereza Negra / Guinda (Cherry)',
    category: 'Frutal Licorosa',
    image: 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Cerezas rojas oscuras brillantes y carnosas con aroma a licor de marrasquino.',
    whatIsIt: 'Nota frutal de gran tendencia gracias a creaciones como Lost Cherry de Tom Ford. Huele a cereza madura bañada en licor con almendras amargas, aportando un juego sensual y atrevido.'
  },
  'manzana': {
    name: 'Manzana Verde / Crujiente',
    category: 'Frutal Fresca',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Manzana verde fresca recién cortada con pulpa crujiente y ácida.',
    whatIsIt: 'Aporta una explosión jovial, desenfadada y refrescante perfecta para el día a día y fragancias deportivas.'
  },
  'menta': {
    name: 'Menta Fresca / Hierbabuena',
    category: 'Aromática Herbal Helada',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Hojas verdes dentadas de menta piperita recién cosechadas.',
    whatIsIt: 'Proporciona una sensación helada vigorizante que despierta los sentidos y realza la frescura del perfume.'
  },
  'salvia': {
    name: 'Salvia Esclarea (Clary Sage)',
    category: 'Aromática Herbal Ambarina',
    image: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=600&q=80',
    visualDescription: 'Planta aromática mediterránea con flores lilas y hojas ricas en esencias ambarinas.',
    whatIsIt: 'Es el puente maestro entre las notas herbales frescas y el fondo ambarino cálido, dando distinción moderna a fragancias masculinas.'
  }
};

/**
 * Normalizes text for dictionary lookup
 */
function cleanLookupKey(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

/**
 * Looks up information for an olfactory note
 */
export function getNoteInfo(rawName: string): OlfactoryNoteInfo {
  const cleaned = cleanLookupKey(rawName);

  // Exact match
  if (OLFACTORY_NOTES_DICTIONARY[cleaned]) {
    return OLFACTORY_NOTES_DICTIONARY[cleaned];
  }

  // Substring match in keys
  for (const [key, info] of Object.entries(OLFACTORY_NOTES_DICTIONARY)) {
    if (cleaned.includes(key) || key.includes(cleaned)) {
      return info;
    }
  }

  // Fallback generic info with a clean perfumery botanicals illustration
  const formattedTitle = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  return {
    name: formattedTitle,
    category: 'Nota Aromática de Perfumería',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    visualDescription: `Materia prima aromática de ${formattedTitle} seleccionada para perfumería fina.`,
    whatIsIt: `Es un ingrediente aromático y nota olfativa de ${formattedTitle} seleccionado por perfumistas para brindar acordes únicos, equilibrar la evolución de la pirámide aromática y enriquecer la fijación y estela de la fragancia en tu piel.`
  };
}

const FARMA_DATA = [ {
  arg: [ "Ibuprofeno", "Ibupirac", "Buscapina Compositum N" ],
  us: "Advil / Motrin",
  marcas: "Advil, Motrin IB, Ibuprofen",
  cat: "Dolor",
  rx: "OTC",
  dosis_arg: "400–600 mg c/8h",
  dosis_arg_en: "400–600 mg every 8h",
  dosis_arg_pt: "400–600 mg a cada 8h",
  dosis_us: "200–400 mg c/4-6h (max 1200 mg/día sin RX)",
  dosis_us_en: "200–400 mg every 4-6h (max 1200 mg/day OTC)",
  dosis_us_pt: "200–400 mg a cada 4-6h (máx 1200 mg/dia sem RX)",
  tip: "En US la dosis OTC máxima es 1200 mg/día. Para más necesitás receta. Encontralo en cualquier farmacia.",
  tip_en: "The max OTC dose in the US is 1200 mg/day. Higher doses require a prescription. Available at any pharmacy.",
  tip_pt: "Nos EUA a dose OTC máxima é 1200 mg/dia. Para doses maiores é necessária receita. Disponível em qualquer farmácia.",
  stores: [ "Walgreens", "CVS", "Walmart" ]
}, {
  arg: [ "Paracetamol", "Acetaminofén", "Tafirol", "Tempra", "Gelocatil" ],
  us: "Tylenol",
  marcas: "Tylenol, Panadol, FeverAll",
  cat: "Dolor",
  rx: "OTC",
  dosis_arg: "500–1000 mg c/6-8h",
  dosis_arg_en: "500–1000 mg every 6-8h",
  dosis_arg_pt: "500–1000 mg a cada 6-8h",
  dosis_us: "325–1000 mg c/4-6h (max 4000 mg/día)",
  dosis_us_en: "325–1000 mg every 4-6h (max 4000 mg/day)",
  dosis_us_pt: "325–1000 mg a cada 4-6h (máx 4000 mg/dia)",
  tip: "⚠️ No mezclar con alcohol. Tylenol Extra Strength = 500 mg por comprimido.",
  tip_en: "⚠️ Do not mix with alcohol. Tylenol Extra Strength = 500 mg per tablet.",
  tip_pt: "⚠️ Não misturar com álcool. Tylenol Extra Strength = 500 mg por comprimido.",
  stores: [ "Walgreens", "CVS", "Walmart", "Target" ]
}, {
  arg: [ "Aspirina", "AAS", "Cardioaspirina" ],
  us: "Aspirin / Bayer",
  marcas: "Bayer Aspirin, Bufferin, Ecotrin",
  cat: "Dolor",
  rx: "OTC",
  dosis_arg: "500–1000 mg c/8h",
  dosis_arg_en: "500–1000 mg every 8h",
  dosis_arg_pt: "500–1000 mg a cada 8h",
  dosis_us: "325–650 mg c/4h (adultos)",
  dosis_us_en: "325–650 mg every 4h (adults)",
  dosis_us_pt: "325–650 mg a cada 4h (adultos)",
  tip: "Baby Aspirin 81 mg = similar a Cardioaspirina. Bufferin tiene protección gástrica.",
  tip_en: "Baby Aspirin 81 mg = similar to Cardioaspirina. Bufferin has gastric protection.",
  tip_pt: "Baby Aspirin 81 mg = similar ao Cardioaspirina. Bufferin tem proteção gástrica.",
  stores: [ "Walgreens", "CVS", "Walmart" ]
}, {
  arg: [ "Diclofenac", "Voltaren", "Cataflam" ],
  us: "Voltaren (gel) / Cambia",
  marcas: "Voltaren Arthritis Pain Gel",
  cat: "Dolor",
  rx: "OTC (gel) / RX (oral)",
  dosis_arg: "50 mg c/8h oral",
  dosis_arg_en: "50 mg every 8h oral",
  dosis_arg_pt: "50 mg a cada 8h oral",
  dosis_us: "Gel 1%: aplicar 4 veces/día. Oral requiere receta.",
  dosis_us_en: "Gel 1%: apply 4 times/day. Oral requires prescription.",
  dosis_us_pt: "Gel 1%: aplicar 4 vezes/dia. Oral requer receita.",
  tip: "El gel Voltaren es OTC en US desde 2020. El diclofenac oral requiere receta médica.",
  tip_en: "Voltaren gel has been OTC in the US since 2020. Oral diclofenac requires a prescription.",
  tip_pt: "O gel Voltaren é OTC nos EUA desde 2020. O diclofenaco oral requer receita médica.",
  stores: [ "Walgreens", "CVS", "Walmart", "Target" ]
}, {
  arg: [ "Naproxeno", "Flanax", "Naxen" ],
  us: "Aleve",
  marcas: "Aleve, Naprosyn (RX)",
  cat: "Dolor",
  rx: "OTC",
  dosis_arg: "500 mg c/12h",
  dosis_arg_en: "500 mg every 12h",
  dosis_arg_pt: "500 mg a cada 12h",
  dosis_us: "220 mg c/8-12h (max 440 mg/día OTC)",
  dosis_us_en: "220 mg every 8-12h (max 440 mg/day OTC)",
  dosis_us_pt: "220 mg a cada 8-12h (máx 440 mg/dia OTC)",
  tip: "Aleve dura más que Advil — útil para dolores musculares fuertes. No mezclar con Ibuprofeno.",
  tip_en: "Aleve lasts longer than Advil — great for strong muscle pain. Do not combine with Ibuprofen.",
  tip_pt: "Aleve dura mais que Advil — útil para dores musculares fortes. Não misturar com Ibuprofeno.",
  stores: [ "Walgreens", "CVS", "Walmart" ]
}, {
  arg: [ "Ketorolac", "Toradol" ],
  us: "Toradol / Ketorolac",
  marcas: "Toradol (RX)",
  cat: "Dolor intenso",
  rx: "RX",
  dosis_arg: "10 mg c/4-6h (máx 5 días)",
  dosis_arg_en: "10 mg every 4-6h (max 5 days)",
  dosis_arg_pt: "10 mg a cada 4-6h (máx 5 dias)",
  dosis_us: "Igual — solo con prescripción",
  dosis_us_en: "Same — prescription only",
  dosis_us_pt: "Igual — somente com receita",
  tip: "Requiere receta en US. Si lo usás en Argentina, llevá el envase para mostrarlo al médico americano.",
  tip_en: "Requires a prescription in the US. If you use it in Argentina, bring the packaging to show the US doctor.",
  tip_pt: "Requer receita nos EUA. Se você usa na Argentina, leve a embalagem para mostrar ao médico americano.",
  stores: [ "Walgreens", "CVS", "Walmart" ]
}, {
  arg: [ "Omeprazol", "Losec", "Ulcozol", "Mepral" ],
  us: "Prilosec",
  marcas: "Prilosec OTC, Omeprazole",
  cat: "Gastro / Digestivo",
  rx: "OTC",
  dosis_arg: "20 mg 1 vez/día en ayunas",
  dosis_arg_en: "20 mg once daily on empty stomach",
  dosis_arg_pt: "20 mg 1 vez/dia em jejum",
  dosis_us: "20 mg 1 vez/día (tratamiento 14 días OTC)",
  dosis_us_en: "20 mg once daily (14-day OTC course)",
  dosis_us_pt: "20 mg 1 vez/dia (tratamento OTC de 14 dias)",
  tip: "Prilosec OTC = 20 mg. Igual dosis que la mayoría de presentaciones ARG. Tomarlo 30 min antes de desayunar.",
  tip_en: "Prilosec OTC = 20 mg — same dose as most Argentine presentations. Take 30 min before breakfast.",
  tip_pt: "Prilosec OTC = 20 mg — mesma dose que a maioria das apresentações ARG. Tomar 30 min antes do café.",
  stores: [ "Walgreens", "CVS", "Walmart", "Target" ]
}, {
  arg: [ "Pantoprazol", "Pantecta", "Zurcal" ],
  us: "Protonix / Pantoprazole",
  marcas: "Pantoprazole, Protonix",
  cat: "Gastro / Digestivo",
  rx: "RX",
  dosis_arg: "40 mg 1 vez/día",
  dosis_arg_en: "40 mg once daily",
  dosis_arg_pt: "40 mg 1 vez/dia",
  dosis_us: "40 mg 1 vez/día — requiere receta",
  dosis_us_en: "40 mg once daily — prescription required",
  dosis_us_pt: "40 mg 1 vez/dia — requer receita",
  tip: "Si lo tomás regularmente, llevá suficiente stock de Argentina o pedí receta al llegar.",
  tip_en: "If you take it regularly, bring enough stock from Argentina or ask for a prescription on arrival.",
  tip_pt: "Se você usa regularmente, leve estoque suficiente da Argentina ou peça receita ao chegar.",
  stores: [ "Walgreens", "CVS", "Walmart" ]
}, {
  arg: [ "Ranitidina", "Zantac" ],
  us: "Zantac 360 (famotidina)",
  marcas: "Zantac 360, Pepcid",
  cat: "Gastro / Digestivo",
  rx: "OTC",
  dosis_arg: "150 mg c/12h",
  dosis_arg_en: "150 mg every 12h",
  dosis_arg_pt: "150 mg a cada 12h",
  dosis_us: "Zantac 360 = 20 mg famotidina. Pepcid AC = 10-20 mg.",
  dosis_us_en: "Zantac 360 = 20 mg famotidine. Pepcid AC = 10-20 mg.",
  dosis_us_pt: "Zantac 360 = 20 mg famotidina. Pepcid AC = 10-20 mg.",
  tip: "⚠️ La ranitidina fue retirada del mercado en US en 2020. El reemplazo es famotidina (Pepcid) o Zantac 360.",
  tip_en: "⚠️ Ranitidine was withdrawn from the US market in 2020. The replacement is famotidine (Pepcid) or Zantac 360.",
  tip_pt: "⚠️ A ranitidina foi retirada do mercado nos EUA em 2020. O substituto é famotidina (Pepcid) ou Zantac 360.",
  stores: [ "Walgreens", "CVS", "Walmart" ]
}, {
  arg: [ "Metoclopramida", "Plasil" ],
  us: "Reglan / Metoclopramide",
  marcas: "Reglan (RX)",
  cat: "Gastro / Digestivo",
  rx: "RX",
  dosis_arg: "10 mg c/8h",
  dosis_arg_en: "10 mg every 8h",
  dosis_arg_pt: "10 mg a cada 8h",
  dosis_us: "10 mg c/8h — solo con receta",
  dosis_us_en: "10 mg every 8h — prescription only",
  dosis_us_pt: "10 mg a cada 8h — somente com receita",
  tip: "Requiere receta en US. Para náuseas OTC: Dramamine (dimenhidrinato) o Bonine (meclizina).",
  tip_en: "Requires a prescription in the US. For OTC nausea relief: Dramamine (dimenhydrinate) or Bonine (meclizine).",
  tip_pt: "Requer receita nos EUA. Para náuseas OTC: Dramamine (dimenidrinato) ou Bonine (meclizina).",
  stores: [ "Walgreens", "CVS", "Walmart" ]
}, {
  arg: [ "Domperidona", "Motilium" ],
  us: "No disponible OTC",
  marcas: "No aprobado por FDA",
  cat: "Gastro / Digestivo",
  rx: "No disponible",
  dosis_arg: "10 mg c/8h",
  dosis_arg_en: "10 mg every 8h",
  dosis_arg_pt: "10 mg a cada 8h",
  dosis_us: "La FDA no aprobó domperidona. Alternativa: Phenergan (prometazina, RX) o Zofran (RX).",
  dosis_us_en: "FDA has not approved domperidone. Alternatives: Phenergan (promethazine, RX) or Zofran (RX).",
  dosis_us_pt: "A FDA não aprovou domperidona. Alternativas: Phenergan (prometazina, RX) ou Zofran (RX).",
  tip: "Llevá stock suficiente de Argentina si lo usás regularmente. No se consigue en farmacias US.",
  tip_en: "Bring enough stock from Argentina if you use it regularly. Not available at US pharmacies.",
  tip_pt: "Leve estoque suficiente da Argentina se você usa regularmente. Não disponível em farmácias dos EUA.",
  stores: [ "N/A" ]
}, {
  arg: [ "Loperamida", "Imodium", "Colonorm" ],
  us: "Imodium",
  marcas: "Imodium A-D, Loperamide",
  cat: "Gastro / Digestivo",
  rx: "OTC",
  dosis_arg: "2 mg después de cada deposición",
  dosis_arg_en: "2 mg after each bowel movement",
  dosis_arg_pt: "2 mg após cada evacuação",
  dosis_us: "2 mg inicial + 1 mg c/deposición (max 8 mg/día)",
  dosis_us_en: "2 mg initial + 1 mg per bowel movement (max 8 mg/day)",
  dosis_us_pt: "2 mg inicial + 1 mg por evacuação (máx 8 mg/dia)",
  tip: "Imodium A-D Liquid = opción suave. Imodium Multi-Symptom también trae simeticona para gases.",
  tip_en: "Imodium A-D Liquid = gentler option. Imodium Multi-Symptom also contains simethicone for gas.",
  tip_pt: "Imodium A-D Liquid = opção mais suave. Imodium Multi-Symptom também tem simeticona para gases.",
  stores: [ "Walgreens", "CVS", "Walmart", "Target" ]
}, {
  arg: [ "Bismuto", "Bismutol", "Pepto-Bismol" ],
  us: "Pepto-Bismol",
  marcas: "Pepto-Bismol, Kaopectate",
  cat: "Gastro / Digestivo",
  rx: "OTC",
  dosis_arg: "524 mg c/30min (máx 8 dosis/día)",
  dosis_arg_en: "524 mg every 30 min (max 8 doses/day)",
  dosis_arg_pt: "524 mg a cada 30 min (máx 8 doses/dia)",
  dosis_us: "Igual dosificación",
  dosis_us_en: "Same dosing",
  dosis_us_pt: "Mesma dosagem",
  tip: "El Pepto-Bismol original de EE.UU. puede teñir la lengua y las heces de negro — es normal.",
  tip_en: "Original US Pepto-Bismol can turn your tongue and stools black — this is normal.",
  tip_pt: "O Pepto-Bismol original dos EUA pode tingir a língua e as fezes de preto — isso é normal.",
  stores: [ "Walgreens", "CVS", "Walmart", "Target" ]
}, {
  arg: [ "Simeticona", "Aerosil", "Gas-X" ],
  us: "Gas-X",
  marcas: "Gas-X, Phazyme, Mylanta Gas",
  cat: "Gastro / Digestivo",
  rx: "OTC",
  dosis_arg: "80-125 mg después de comer",
  dosis_arg_en: "80-125 mg after eating",
  dosis_arg_pt: "80-125 mg após comer",
  dosis_us: "125-250 mg después de comer",
  dosis_us_en: "125-250 mg after eating",
  dosis_us_pt: "125-250 mg após comer",
  tip: "Gas-X Extra Strength = 125 mg. Se disuelve en boca. Muy fácil de conseguir.",
  tip_en: "Gas-X Extra Strength = 125 mg. Dissolves in the mouth. Very easy to find.",
  tip_pt: "Gas-X Extra Strength = 125 mg. Se dissolve na boca. Muito fácil de encontrar.",
  stores: [ "Walgreens", "CVS", "Walmart" ]
}, {
  arg: [ "Antiácido", "Calcital", "Tums", "Mylanta" ],
  us: "Tums / Maalox",
  marcas: "Tums, Rolaids, Maalox, Mylanta",
  cat: "Gastro / Digestivo",
  rx: "OTC",
  dosis_arg: "Según marca",
  dosis_arg_en: "Per brand instructions",
  dosis_arg_pt: "Conforme a marca",
  dosis_us: "Tums 500-1000 mg c/4h según síntomas",
  dosis_us_en: "Tums 500-1000 mg every 4h as needed",
  dosis_us_pt: "Tums 500-1000 mg a cada 4h conforme sintomas",
  tip: "Tums también sirve como suplemento de calcio. Maalox y Mylanta son líquidos — para acidez intensa.",
  tip_en: "Tums also works as a calcium supplement. Maalox and Mylanta are liquids — better for severe heartburn.",
  tip_pt: "Tums também funciona como suplemento de cálcio. Maalox e Mylanta são líquidos — para azia intensa.",
  stores: [ "Walgreens", "CVS", "Walmart", "Target" ]
}, {
  arg: [ "Loratadina", "Clarityne", "Loratin" ],
  us: "Claritin",
  marcas: "Claritin, Alavert, Loratadine",
  cat: "Alergia",
  rx: "OTC",
  dosis_arg: "10 mg 1 vez/día",
  dosis_arg_en: "10 mg once daily",
  dosis_arg_pt: "10 mg 1 vez/dia",
  dosis_us: "10 mg 1 vez/día",
  dosis_us_en: "10 mg once daily",
  dosis_us_pt: "10 mg 1 vez/dia",
  tip: "Claritin Non-Drowsy = loratadina. No produce sueño. Ideal para actividades de día.",
  tip_en: "Claritin Non-Drowsy = loratadine. Non-sedating. Ideal for daytime activities.",
  tip_pt: "Claritin Non-Drowsy = loratadina. Não causa sonolência. Ideal para atividades diurnas.",
  stores: [ "Walgreens", "CVS", "Walmart", "Target" ]
}, {
  arg: [ "Cetirizina", "Zyrtec", "Zetir" ],
  us: "Zyrtec",
  marcas: "Zyrtec, Cetirizine HCl",
  cat: "Alergia",
  rx: "OTC",
  dosis_arg: "10 mg 1 vez/día",
  dosis_arg_en: "10 mg once daily",
  dosis_arg_pt: "10 mg 1 vez/dia",
  dosis_us: "10 mg 1 vez/día",
  dosis_us_en: "10 mg once daily",
  dosis_us_pt: "10 mg 1 vez/dia",
  tip: "Puede causar algo de somnolencia. Ideal para alergias nocturnas o urticaria. Genérico en Costco muy barato.",
  tip_en: "May cause mild drowsiness. Great for nighttime allergies or hives. Generic at Costco is very affordable.",
  tip_pt: "Pode causar leve sonolência. Ótimo para alergias noturnas ou urticária. Genérico na Costco é muito barato.",
  stores: [ "Walgreens", "CVS", "Walmart", "Costco" ]
}, {
  arg: [ "Fexofenadina", "Allegra", "Fexofed" ],
  us: "Allegra",
  marcas: "Allegra, Fexofenadine",
  cat: "Alergia",
  rx: "OTC",
  dosis_arg: "120-180 mg 1 vez/día",
  dosis_arg_en: "120-180 mg once daily",
  dosis_arg_pt: "120-180 mg 1 vez/dia",
  dosis_us: "180 mg 1 vez/día (adultos)",
  dosis_us_en: "180 mg once daily (adults)",
  dosis_us_pt: "180 mg 1 vez/dia (adultos)",
  tip: "La menos sedante de las antihistamínicas. No tomar con jugo de naranja (reduce absorción).",
  tip_en: "The least sedating antihistamine. Do not take with orange juice — it reduces absorption.",
  tip_pt: "O anti-histamínico menos sedante. Não tomar com suco de laranja — reduz a absorção.",
  stores: [ "Walgreens", "CVS", "Walmart", "Target" ]
}, {
  arg: [ "Difenhidramina", "Benadryl", "Histamin" ],
  us: "Benadryl",
  marcas: "Benadryl, ZzzQuil, Unisom SleepTabs",
  cat: "Alergia",
  rx: "OTC",
  dosis_arg: "25-50 mg c/4-6h",
  dosis_arg_en: "25-50 mg every 4-6h",
  dosis_arg_pt: "25-50 mg a cada 4-6h",
  dosis_us: "25-50 mg c/4-6h (max 300 mg/día)",
  dosis_us_en: "25-50 mg every 4-6h (max 300 mg/day)",
  dosis_us_pt: "25-50 mg a cada 4-6h (máx 300 mg/dia)",
  tip: "⚠️ Produce mucho sueño. También se vende como ayuda para dormir (ZzzQuil). No manejar.",
  tip_en: "⚠️ Causes heavy drowsiness. Also sold as a sleep aid (ZzzQuil). Do not drive.",
  tip_pt: "⚠️ Causa muita sonolência. Também vendido como indutor de sono (ZzzQuil). Não dirigir.",
  stores: [ "Walgreens", "CVS", "Walmart", "Target" ]
}, {
  arg: [ "Fluticasona nasal", "Flixonase", "Avamys" ],
  us: "Flonase",
  marcas: "Flonase Allergy Relief",
  cat: "Alergia",
  rx: "OTC",
  dosis_arg: "50 mcg/puff, 2 puffs c/fosa 1v/día",
  dosis_arg_en: "50 mcg/puff, 2 puffs per nostril once daily",
  dosis_arg_pt: "50 mcg/puff, 2 puffs por narina 1x/dia",
  dosis_us: "Igual dosificación",
  dosis_us_en: "Same dosing",
  dosis_us_pt: "Mesma dosagem",
  tip: "Flonase OTC desde 2014 en US. Efecto máximo tarda 1-2 semanas. Usar diario, no solo cuando hay síntomas.",
  tip_en: "Flonase OTC since 2014 in the US. Full effect takes 1-2 weeks. Use daily, not just when symptomatic.",
  tip_pt: "Flonase OTC desde 2014 nos EUA. Efeito máximo em 1-2 semanas. Usar diariamente, não só quando sintomático.",
  stores: [ "Walgreens", "CVS", "Walmart", "Target" ]
}, {
  arg: [ "Ambroxol", "Mucosolvan", "Flemex" ],
  us: "Mucinex",
  marcas: "Mucinex, Robitussin Chest Congestion",
  cat: "Tos / Resfrío",
  rx: "OTC",
  dosis_arg: "30 mg c/8h",
  dosis_arg_en: "30 mg every 8h",
  dosis_arg_pt: "30 mg a cada 8h",
  dosis_us: "Guaifenesina 400 mg c/4h (Mucinex regular) o 600-1200 mg ER c/12h",
  dosis_us_en: "Guaifenesin 400 mg every 4h (regular) or 600-1200 mg ER every 12h",
  dosis_us_pt: "Guaifenesina 400 mg a cada 4h (regular) ou 600-1200 mg ER a cada 12h",
  tip: "Mucinex = guaifenesina (expectorante). No es ambroxol exacto pero efecto similar. Tomarlo con mucha agua.",
  tip_en: "Mucinex = guaifenesin (expectorant). Not exactly ambroxol but similar effect. Take with plenty of water.",
  tip_pt: "Mucinex = guaifenesina (expectorante). Não é ambroxol exato, mas efeito similar. Tomar com bastante água.",
  stores: [ "Walgreens", "CVS", "Walmart", "Target" ]
}, {
  arg: [ "Pseudoefedrina", "Sudafed", "Rinofed" ],
  us: "Sudafed",
  marcas: "Sudafed 12 Hour, Sudafed PE",
  cat: "Tos / Resfrío",
  rx: "OTC (detrás del mostrador)",
  dosis_arg: "60 mg c/6h",
  dosis_arg_en: "60 mg every 6h",
  dosis_arg_pt: "60 mg a cada 6h",
  dosis_us: "30-60 mg c/4-6h (Sudafed regular)",
  dosis_us_en: "30-60 mg every 4-6h (regular Sudafed)",
  dosis_us_pt: "30-60 mg a cada 4-6h (Sudafed regular)",
  tip: "⚠️ En US hay que pedirlo en la farmacia mostrando ID (por ley). Sudafed PE (fenilefrina) está en góndola pero es menos efectivo.",
  tip_en: "⚠️ In the US you must ask the pharmacist and show ID (required by law). Sudafed PE (phenylephrine) is on the shelf but less effective.",
  tip_pt: "⚠️ Nos EUA é necessário pedir ao farmacêutico e mostrar ID (exigido por lei). Sudafed PE (fenilefrina) está na prateleira mas é menos eficaz.",
  stores: [ "Walgreens", "CVS", "Walmart" ]
}, {
  arg: [ "Dextrometorfano", "Vick 44", "Brontol" ],
  us: "Robitussin DM / Delsym",
  marcas: "Delsym, Robitussin DM, NyQuil",
  cat: "Tos / Resfrío",
  rx: "OTC",
  dosis_arg: "15-30 mg c/6-8h",
  dosis_arg_en: "15-30 mg every 6-8h",
  dosis_arg_pt: "15-30 mg a cada 6-8h",
  dosis_us: "15-30 mg c/4h o 60 mg ER c/12h (Delsym)",
  dosis_us_en: "15-30 mg every 4h or 60 mg ER every 12h (Delsym)",
  dosis_us_pt: "15-30 mg a cada 4h ou 60 mg ER a cada 12h (Delsym)",
  tip: "Delsym 12 Hour = formulación prolongada, muy cómoda para viajeros. NyQuil combina DXM + antihistamínico.",
  tip_en: "Delsym 12 Hour = extended-release formula, very convenient for travelers. NyQuil combines DXM + antihistamine.",
  tip_pt: "Delsym 12 Hour = fórmula de liberação prolongada, muito prática para viajantes. NyQuil combina DXM + anti-histamínico.",
  stores: [ "Walgreens", "CVS", "Walmart", "Target" ]
}, {
  arg: [ "Ergotamina", "Cafergot" ],
  us: "No disponible OTC",
  marcas: "Solo RX (Cafergot, Migergot)",
  cat: "Migraña",
  rx: "RX",
  dosis_arg: "1-2 mg al inicio de migraña",
  dosis_arg_en: "1-2 mg at migraine onset",
  dosis_arg_pt: "1-2 mg no início da enxaqueca",
  dosis_us: "Solo con prescripción médica",
  dosis_us_en: "Prescription only",
  dosis_us_pt: "Somente com receita médica",
  tip: "Llevá stock si lo usás. Alternativa OTC: Excedrin Migraine (paracetamol + aspirina + cafeína) muy efectivo.",
  tip_en: "Bring stock if you use it. OTC alternative: Excedrin Migraine (acetaminophen + aspirin + caffeine) — very effective.",
  tip_pt: "Leve estoque se usa. Alternativa OTC: Excedrin Migraine (paracetamol + aspirina + cafeína) — muito eficaz.",
  stores: [ "Walgreens", "CVS", "Walmart" ]
}, {
  arg: [ "Excedrin", "Cafiaspirina" ],
  us: "Excedrin Migraine",
  marcas: "Excedrin Migraine, Excedrin Extra Strength",
  cat: "Migraña",
  rx: "OTC",
  dosis_arg: "Similar combinación",
  dosis_arg_en: "Similar combination",
  dosis_arg_pt: "Combinação similar",
  dosis_us: "2 comprimidos al inicio. No más de 2 por día.",
  dosis_us_en: "2 tablets at onset. No more than 2 per day.",
  dosis_us_pt: "2 comprimidos no início. Não mais de 2 por dia.",
  tip: "Combinación de 250 mg acetaminofén + 250 mg aspirina + 65 mg cafeína. Muy popular en US para migrañas.",
  tip_en: "Combination of 250 mg acetaminophen + 250 mg aspirin + 65 mg caffeine. Very popular in the US for migraines.",
  tip_pt: "Combinação de 250 mg paracetamol + 250 mg aspirina + 65 mg cafeína. Muito popular nos EUA para enxaquecas.",
  stores: [ "Walgreens", "CVS", "Walmart", "Target" ]
}, {
  arg: [ "Melatonina", "Circadin" ],
  us: "Melatonin",
  marcas: "Natrol, Nature Made, Olly Sleep",
  cat: "Sueño / Jet lag",
  rx: "OTC",
  dosis_arg: "2-5 mg antes de dormir",
  dosis_arg_en: "2-5 mg before sleep",
  dosis_arg_pt: "2-5 mg antes de dormir",
  dosis_us: "0.5-5 mg 30 min antes de dormir",
  dosis_us_en: "0.5-5 mg 30 min before sleep",
  dosis_us_pt: "0.5-5 mg 30 min antes de dormir",
  tip: "En US la melatonina es suplemento (no medicamento). Dosis de 0.5-1 mg pueden ser suficientes. Útil para jet lag.",
  tip_en: "In the US, melatonin is a supplement (not a drug). 0.5-1 mg doses can be enough. Helpful for jet lag.",
  tip_pt: "Nos EUA a melatonina é suplemento (não medicamento). Doses de 0,5-1 mg podem ser suficientes. Útil para jet lag.",
  stores: [ "Walgreens", "CVS", "Walmart", "Target", "Costco" ]
}, {
  arg: [ "Diazepam", "Valium" ],
  us: "Valium / Diazepam",
  marcas: "Valium (RX)",
  cat: "Ansiolítico",
  rx: "RX (Schedule IV)",
  dosis_arg: "2-10 mg",
  dosis_arg_en: "2-10 mg",
  dosis_arg_pt: "2-10 mg",
  dosis_us: "Solo con receta — declararlo en aduana si viajás con él",
  dosis_us_en: "Prescription only — declare it at customs if traveling with it",
  dosis_us_pt: "Somente com receita — declarar na alfândega se viajar com ele",
  tip: "⚠️ Es sustancia controlada en US. Llevá receta médica del médico argentino (en inglés si es posible) y declararlo en aduana.",
  tip_en: "⚠️ It is a controlled substance in the US. Carry your Argentine doctor's prescription (in English if possible) and declare it at customs.",
  tip_pt: "⚠️ É substância controlada nos EUA. Leve a receita do médico argentino (em inglês se possível) e declare na alfândega.",
  stores: [ "Walgreens", "CVS", "Walmart" ]
}, {
  arg: [ "Hidrocortisona crema", "Cortiprex" ],
  us: "Cortaid / Hydrocortisone",
  marcas: "Cortaid, CortaGel, Aveeno 1%",
  cat: "Piel",
  rx: "OTC (hasta 1%)",
  dosis_arg: "Aplicar 2-4 veces/día",
  dosis_arg_en: "Apply 2-4 times/day",
  dosis_arg_pt: "Aplicar 2-4 vezes/dia",
  dosis_us: "Hasta 1% OTC; 2.5% con receta",
  dosis_us_en: "Up to 1% OTC; 2.5% requires prescription",
  dosis_us_pt: "Até 1% OTC; 2,5% requer receita",
  tip: "Cortaid Maximum Strength = 1%. Para picaduras, dermatitis leve. Más del 1% requiere receta.",
  tip_en: "Cortaid Maximum Strength = 1%. For insect bites and mild dermatitis. Above 1% requires a prescription.",
  tip_pt: "Cortaid Maximum Strength = 1%. Para picadas e dermatite leve. Acima de 1% requer receita.",
  stores: [ "Walgreens", "CVS", "Walmart", "Target" ]
}, {
  arg: [ "Clotrimazol", "Canesten", "Gyne-Lotrimin" ],
  us: "Lotrimin / Monistat",
  marcas: "Lotrimin AF (pie de atleta), Monistat (vaginal)",
  cat: "Piel",
  rx: "OTC",
  dosis_arg: "1% aplicar 2 veces/día",
  dosis_arg_en: "1% apply twice daily",
  dosis_arg_pt: "1% aplicar 2 vezes/dia",
  dosis_us: "Misma concentración",
  dosis_us_en: "Same concentration",
  dosis_us_pt: "Mesma concentração",
  tip: "Lotrimin AF para hongos en piel. Monistat 1, 3 o 7 para candidiasis vaginal — los números son días de tratamiento.",
  tip_en: "Lotrimin AF for skin fungal infections. Monistat 1, 3 or 7 for vaginal yeast — numbers indicate treatment days.",
  tip_pt: "Lotrimin AF para fungos na pele. Monistat 1, 3 ou 7 para candidíase vaginal — os números indicam dias de tratamento.",
  stores: [ "Walgreens", "CVS", "Walmart", "Target" ]
}, {
  arg: [ "Betametasona crema", "Diproderm" ],
  us: "Solo RX",
  marcas: "Diprolene, Luxíq (RX)",
  cat: "Piel",
  rx: "RX",
  dosis_arg: "Aplicar 1-2 veces/día",
  dosis_arg_en: "Apply 1-2 times/day",
  dosis_arg_pt: "Aplicar 1-2 vezes/dia",
  dosis_us: "Requiere receta — corticoide potente",
  dosis_us_en: "Prescription required — potent corticosteroid",
  dosis_us_pt: "Requer receita — corticoide potente",
  tip: "Llevá tu crema de Argentina. No se consigue OTC en US porque es corticoide de alta potencia.",
  tip_en: "Bring your cream from Argentina. Not available OTC in the US as it is a high-potency corticosteroid.",
  tip_pt: "Leve seu creme da Argentina. Não disponível OTC nos EUA por ser corticoide de alta potência.",
  stores: [ "Walgreens", "CVS", "Walmart" ]
}, {
  arg: [ "Lágrimas artificiales", "Refresh", "Artelac" ],
  us: "Refresh / Systane",
  marcas: "Refresh Tears, Systane Ultra, Visine Tears",
  cat: "Ojos",
  rx: "OTC",
  dosis_arg: "1-2 gotas según necesidad",
  dosis_arg_en: "1-2 drops as needed",
  dosis_arg_pt: "1-2 gotas conforme necessário",
  dosis_us: "Igual",
  dosis_us_en: "Same",
  dosis_us_pt: "Igual",
  tip: "Refresh y Systane son las marcas más comunes. Preferí las sin conservantes (monodosis) si usás lentes de contacto.",
  tip_en: "Refresh and Systane are the most common brands. Prefer preservative-free (unit dose) if you wear contact lenses.",
  tip_pt: "Refresh e Systane são as marcas mais comuns. Prefira sem conservantes (monodose) se usar lentes de contato.",
  stores: [ "Walgreens", "CVS", "Walmart", "Target" ]
}, {
  arg: [ "Ibuprofeno + Pseudoefedrina", "Actifed" ],
  us: "Advil Cold & Sinus",
  marcas: "Advil Cold & Sinus, Motrin Cold",
  cat: "Tos / Resfrío",
  rx: "OTC (detrás del mostrador)",
  dosis_arg: "Según presentación",
  dosis_arg_en: "Per packaging",
  dosis_arg_pt: "Conforme embalagem",
  dosis_us: "Ibuprofeno 200 mg + Pseudoefedrina 30 mg c/6h",
  dosis_us_en: "Ibuprofen 200 mg + Pseudoephedrine 30 mg every 6h",
  dosis_us_pt: "Ibuprofeno 200 mg + Pseudoefedrina 30 mg a cada 6h",
  tip: "Requiere ID en la farmacia por la pseudoefedrina. Muy efectivo para resfrío con congestión.",
  tip_en: "ID required at the pharmacy due to pseudoephedrine regulations. Very effective for cold with congestion.",
  tip_pt: "Necessário mostrar ID na farmácia por causa da pseudoefedrina. Muito eficaz para resfriado com congestão.",
  stores: [ "Walgreens", "CVS" ]
}, {
  arg: [ "Sales de rehidratación", "Electrolit", "Gatorade" ],
  us: "Pedialyte / Gatorade",
  marcas: "Pedialyte, Liquid IV, DripDrop",
  cat: "Rehidratación",
  rx: "OTC",
  dosis_arg: "Según presentación",
  dosis_arg_en: "Per packaging",
  dosis_arg_pt: "Conforme embalagem",
  dosis_us: "Pedialyte es el más completo. Liquid IV es el favorito de viajeros.",
  dosis_us_en: "Pedialyte is the most complete. Liquid IV is travelers' favorite.",
  dosis_us_pt: "Pedialyte é o mais completo. Liquid IV é o favorito dos viajantes.",
  tip: "Liquid IV (sobres para disolver) es ideal para llevar de viaje. Lo venden en Costco en packs grandes.",
  tip_en: "Liquid IV (powder packets) is ideal for travel. Available at Costco in large packs.",
  tip_pt: "Liquid IV (sachês para dissolver) é ideal para viagem. Vendido na Costco em packs grandes.",
  stores: [ "Walgreens", "CVS", "Walmart", "Costco", "Target" ]
}, {
  arg: [ "Vitamina C", "Redoxon" ],
  us: "Emergen-C / Airborne",
  marcas: "Emergen-C, Airborne, Nature Made",
  cat: "Vitaminas",
  rx: "OTC",
  dosis_arg: "500-1000 mg/día",
  dosis_arg_en: "500-1000 mg/day",
  dosis_arg_pt: "500-1000 mg/dia",
  dosis_us: "1000 mg/sobre (Emergen-C). Disolver en agua.",
  dosis_us_en: "1000 mg/packet (Emergen-C). Dissolve in water.",
  dosis_us_pt: "1000 mg/sachê (Emergen-C). Dissolver em água.",
  tip: "Emergen-C es la vitamina C más popular en US. Viene en sabores y se disuelve en agua. Muy barato en Costco.",
  tip_en: "Emergen-C is the most popular vitamin C in the US. Comes in flavors and dissolves in water. Very cheap at Costco.",
  tip_pt: "Emergen-C é a vitamina C mais popular nos EUA. Vem em sabores e se dissolve em água. Muito barato na Costco.",
  stores: [ "Walgreens", "CVS", "Walmart", "Costco", "Target" ]
} ];

let farmaActiveCat = "all";

function farmaRender(list) {
  const grid = document.getElementById("farma-grid");
  const empty = document.getElementById("farma-empty");
  if (!list.length) {
    grid.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";
  const lang = localStorage.getItem("appLang") || "es";
  const t = window.i18n[lang] || window.i18n.es;
  const catMap = FARMA_CAT_LABELS[lang] || FARMA_CAT_LABELS.es;
  const tipKey = lang === "en" ? "tip_en" : lang === "pt" ? "tip_pt" : "tip";
  const dosisArgKey = lang === "en" ? "dosis_arg_en" : lang === "pt" ? "dosis_arg_pt" : "dosis_arg";
  const dosisUsKey = lang === "en" ? "dosis_us_en" : lang === "pt" ? "dosis_us_pt" : "dosis_us";
  const flagAR = `<img src="https://flagcdn.com/w20/ar.png" width="16" style="border-radius:2px;vertical-align:middle;margin-right:3px;" alt="AR" onerror="this.outerHTML='🇦🇷'">`;
  const flagUS = `<img src="https://flagcdn.com/w20/us.png" width="16" style="border-radius:2px;vertical-align:middle;margin-right:3px;" alt="US" onerror="this.outerHTML='🇺🇸'">`;
  grid.innerHTML = list.map((m, i) => {
    const rxClass = m.rx === "OTC" ? "otc" : "rx";
    const rxLabel = m.rx === "OTC" ? t.farma_otc : m.rx === "RX" ? t.farma_rx : t.farma_no_disp;
    const stores = m.stores.map(s => `<span class="farma-store">${s}</span>`).join("");
    const aliases = m.arg.slice(1).length ? `<div style="font-size:.68rem;color:var(--text-dim);margin-top:2px;">${t.farma_aliases} ${m.arg.slice(1).join(", ")}</div>` : "";
    const catLabel = catMap[m.cat] || m.cat;
    const tipText = m[tipKey] || m.tip;
    const dosisArg = m[dosisArgKey] || m.dosis_arg;
    const dosisUs = m[dosisUsKey] || m.dosis_us;
    return `<div class="farma-card" style="animation-delay:${i * .04}s">\n            <div class="farma-header">\n                <div class="farma-names">\n                    <div class="farma-arg">💊 ${m.arg[0]}</div>\n                    ${aliases}\n                    <div class="farma-us">${flagUS}${m.us}</div>\n                    <div style="font-size:.68rem;color:var(--text-dim);margin-top:2px;">${t.farma_marcas} ${m.marcas}</div>\n                </div>\n                <div class="farma-badges">\n                    <span class="badge-rx ${rxClass}">${rxLabel}</span>\n                    <span class="badge-cat">${catLabel}</span>\n                </div>\n            </div>\n            <div class="farma-divider"></div>\n            <div class="farma-detail">\n                <div class="farma-detail-item">\n                    <span class="farma-detail-lbl">${flagAR}${t.farma_dosis_arg}</span>\n                    <span class="farma-detail-val">${dosisArg}</span>\n                </div>\n                <div class="farma-detail-item">\n                    <span class="farma-detail-lbl">${flagUS}${t.farma_dosis_us}</span>\n                    <span class="farma-detail-val">${dosisUs}</span>\n                </div>\n            </div>\n            <div class="farma-tip">💡 ${String(tipText).startsWith("⚠️") ? `<span class="farma-warn">${window.uiIcon ? window.uiIcon("alert", 13) : "⚠️"}</span>${String(tipText).replace(/^⚠️\s*/, "")}` : tipText}</div>\n            <div class="farma-stores">${stores}</div>\n        </div>`;
  }).join("");
}

function farmaGetFiltered(q, cat) {
  let list = FARMA_DATA;
  if (cat && cat !== "all") list = list.filter(m => m.cat === cat);
  if (q && q.length > 1) {
    const ql = q.toLowerCase();
    list = list.filter(m => m.arg.some(a => a.toLowerCase().includes(ql)) || m.us.toLowerCase().includes(ql) || m.marcas.toLowerCase().includes(ql) || m.cat.toLowerCase().includes(ql));
  }
  return list;
}

window.farmaFilter = function(q) {
  const clear = document.getElementById("farma-clear");
  if (clear) clear.style.display = q ? "block" : "none";
  farmaRender(farmaGetFiltered(q, farmaActiveCat));
};

window.farmaGetFilteredCurrent = function() {
  const q = document.getElementById("farma-search")?.value || "";
  return farmaGetFiltered(q, farmaActiveCat);
};

const FARMA_CAT_LABELS = {
  es: {
    Dolor: "Dolor",
    "Dolor intenso": "Dolor intenso",
    "Gastro / Digestivo": "Gastro / Digestivo",
    Alergia: "Alergia",
    "Tos / Resfrío": "Tos / Resfrío",
    "Migraña": "Migraña",
    "Sueño / Jet lag": "Sueño / Jet lag",
    "Ansiolítico": "Ansiolítico",
    Piel: "Piel",
    Ojos: "Ojos",
    "Rehidratación": "Rehidratación",
    Vitaminas: "Vitaminas"
  },
  en: {
    Dolor: "Pain",
    "Dolor intenso": "Strong Pain",
    "Gastro / Digestivo": "Gastro / Digestive",
    Alergia: "Allergy",
    "Tos / Resfrío": "Cough / Cold",
    "Migraña": "Migraine",
    "Sueño / Jet lag": "Sleep / Jet lag",
    "Ansiolítico": "Anxiolytic",
    Piel: "Skin",
    Ojos: "Eyes",
    "Rehidratación": "Rehydration",
    Vitaminas: "Vitamins"
  },
  pt: {
    Dolor: "Dor",
    "Dolor intenso": "Dor intensa",
    "Gastro / Digestivo": "Gastro / Digestivo",
    Alergia: "Alergia",
    "Tos / Resfrío": "Tosse / Resfriado",
    "Migraña": "Enxaqueca",
    "Sueño / Jet lag": "Sono / Jet lag",
    "Ansiolítico": "Ansiolítico",
    Piel: "Pele",
    Ojos: "Olhos",
    "Rehidratación": "Reidratação",
    Vitaminas: "Vitaminas"
  }
};

function farmaInitCats() {
  const cats = [ "all", ...new Set(FARMA_DATA.map(m => m.cat)) ];
  const lang = localStorage.getItem("appLang") || "es";
  const allLabel = {
    es: "Todos",
    en: "All",
    pt: "Todos"
  }[lang] || "Todos";
  const catMap = FARMA_CAT_LABELS[lang] || FARMA_CAT_LABELS.es;
  const container = document.getElementById("farma-cats");
  if (!container) return;
  container.innerHTML = cats.map(c => {
    const label = c === "all" ? allLabel : catMap[c] || c;
    const active = c === farmaActiveCat ? " active" : "";
    return `<button class="cat-filter-btn${active}" data-cat="${c}" onclick="farmaSetCat('${c}')">${label}</button>`;
  }).join("");
}

window.farmaInitCats = farmaInitCats;

window.farmaSetCat = function(cat) {
  farmaActiveCat = cat;
  document.querySelectorAll(".cat-filter-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.cat === cat);
  });
  const q = document.getElementById("farma-search")?.value || "";
  farmaRender(farmaGetFiltered(q, cat));
};

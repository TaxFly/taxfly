const FRASES_CATS = [ {
  id: "shopping",
  emoji: "🛍️",
  label: "Shopping",
  frases: [ {
    en: "Do you have this in a larger / smaller size?",
    fon: "Du yu jav dis in a lárger / smóler sais?",
    ctx_es: "En tiendas cuando probás ropa y no encontrás tu talle.",
    ctx_en: "At stores when trying on clothes and your size isn't on the rack.",
    ctx_pt: "Em lojas quando você está experimentando roupas e não encontra seu tamanho."
  }, {
    en: "Where can I find the fitting rooms?",
    fon: "Wér can ái faind de fíting rums?",
    ctx_es: "Para buscar los probadores.",
    ctx_en: "To find the dressing rooms in the store.",
    ctx_pt: "Para encontrar os provadores na loja."
  }, {
    en: "Is this on sale?",
    fon: "Is dis on séil?",
    ctx_es: 'Preguntá si tiene descuento. "On sale" = en oferta.',
    ctx_en: "Ask if there's a discount. \"On sale\" means it's discounted.",
    ctx_pt: 'Pergunte se tem desconto. "On sale" = em promoção.'
  }, {
    en: "Do you price match?",
    fon: "Du yu práis mach?",
    ctx_es: "Si viste el mismo producto más barato en otro lado, podés pedirles que igualen el precio.",
    ctx_en: "If you found the same product cheaper elsewhere, you can ask them to match that price.",
    ctx_pt: "Se você viu o mesmo produto mais barato em outro lugar, pode pedir que igualem o preço."
  }, {
    en: "Can I get a rain check?",
    fon: "Can ái guet a réin chek?",
    ctx_es: "Si un producto en oferta está agotado, podés pedir un voucher para comprarlo al precio de oferta cuando llegue stock.",
    ctx_en: "If a sale item is sold out, you can request a voucher to buy it at the sale price once it's restocked.",
    ctx_pt: "Se um produto em promoção estiver esgotado, você pode pedir um voucher para comprá-lo pelo preço promocional quando chegar estoque."
  }, {
    en: "Do you have this in stock?",
    fon: "Du yu jav dis in stok?",
    ctx_es: "Para saber si tienen disponible el producto.",
    ctx_en: "To check if the product is currently available.",
    ctx_pt: "Para saber se o produto está disponível."
  }, {
    en: "Where is the clearance section?",
    fon: "Wér is de klírans sékshon?",
    ctx_es: '"Clearance" = sección de liquidación, los precios más bajos de la tienda.',
    ctx_en: '"Clearance" = the markdown section with the lowest prices in the store.',
    ctx_pt: '"Clearance" = seção de liquidação, os preços mais baixos da loja.'
  }, {
    en: "Can I return this without a receipt?",
    fon: "Can ái ritérn dis widáut a risít?",
    ctx_es: "Para devolver sin ticket. Muchas tiendas US aceptan devoluciones con tarjeta.",
    ctx_en: "To return without a receipt. Many US stores accept returns linked to your credit card.",
    ctx_pt: "Para devolver sem comprovante. Muitas lojas nos EUA aceitam devoluções vinculadas ao cartão."
  }, {
    en: "Do you offer a student / military discount?",
    fon: "Du yu ófer a stiúdent / mílitari diskáunt?",
    ctx_es: "Muchas tiendas tienen descuentos especiales para estudiantes y militares.",
    ctx_en: "Many stores offer special discounts for students and military personnel.",
    ctx_pt: "Muitas lojas têm descontos especiais para estudantes e militares."
  }, {
    en: "Is tax included in this price?",
    fon: "Is taxinklúded in dis práis?",
    ctx_es: "El precio en góndola NO incluye impuestos en casi todos los estados de US.",
    ctx_en: "The shelf price does NOT include tax in almost every US state.",
    ctx_pt: "O preço na gôndola NÃO inclui impostos na maioria dos estados americanos."
  }, {
    en: "What's your return policy?",
    fon: "Uats yor ritérn pólisi?",
    ctx_es: "Preguntá cuántos días tienen para devolver y si necesitan el recibo.",
    ctx_en: "Ask how many days you have to return and whether a receipt is required.",
    ctx_pt: "Pergunte quantos dias você tem para devolver e se precisa do comprovante."
  }, {
    en: "Can I pay with a foreign credit card?",
    fon: "Can ái péi uid a fóren krédit kard?",
    ctx_es: "La mayoría acepta Visa/Mastercard internacionales. Avisá si tu tarjeta trae chip.",
    ctx_en: "Most stores accept international Visa/Mastercard. Mention if your card has a chip.",
    ctx_pt: "A maioria aceita Visa/Mastercard internacionais. Avise se seu cartão tem chip."
  }, {
    en: "Do you have a loyalty program?",
    fon: "Du yu jav a lóyalti próugram?",
    ctx_es: "Programas de puntos/descuentos por ser cliente frecuente. Vale la pena si comprás mucho.",
    ctx_en: "Points/discount programs for frequent shoppers. Worth signing up if you buy often.",
    ctx_pt: "Programas de pontos/descontos para clientes frequentes. Vale a pena se você compra bastante."
  }, {
    en: "Could you gift wrap this, please?",
    fon: "Kud yu guíft rap dis, plís?",
    ctx_es: "Pedir envoltura para regalo.",
    ctx_en: "Ask to have the item wrapped as a gift.",
    ctx_pt: "Pedir para embrulhar como presente."
  }, {
    en: "I'm just browsing, thanks.",
    fon: "Aim yast bráusing, zanks.",
    ctx_es: "Cuando un vendedor te pregunta si necesitás ayuda y solo estás mirando.",
    ctx_en: "When a salesperson asks if you need help and you're just looking around.",
    ctx_pt: "Quando um vendedor pergunta se você precisa de ajuda e você está só olhando."
  } ]
}, {
  id: "restaurante",
  emoji: "🍔",
  label: "Restaurante",
  frases: [ {
    en: "Table for two, please.",
    fon: "Téibel for tu, plís.",
    ctx_es: "Para pedir mesa al entrar a un restaurante.",
    ctx_en: "To request a table when entering a restaurant.",
    ctx_pt: "Para pedir mesa ao entrar em um restaurante."
  }, {
    en: "Can we sit outside?",
    fon: "Can ui sit áutsaid?",
    ctx_es: "Pedir mesa al aire libre / terraza.",
    ctx_en: "Ask for an outdoor / patio table.",
    ctx_pt: "Pedir mesa ao ar livre / terraço."
  }, {
    en: "What do you recommend?",
    fon: "Uat du yu rékoménd?",
    ctx_es: "Preguntarle al mozo qué está bueno.",
    ctx_en: "Ask the waiter what's good.",
    ctx_pt: "Perguntar ao garçom o que está bom."
  }, {
    en: "I'll have the same.",
    fon: "Áil jav de séim.",
    ctx_es: "Pedir lo mismo que otra persona de tu mesa. Útil y rápido.",
    ctx_en: "Order the same as someone else at your table. Quick and easy.",
    ctx_pt: "Pedir o mesmo que outra pessoa da sua mesa. Rápido e prático."
  }, {
    en: "Could I get this to go, please?",
    fon: "Kud ái guet dis tu góu, plís.",
    ctx_es: 'Pedir para llevar. También "Can I get a doggy bag?" si te sobra comida.',
    ctx_en: 'Ask for your order to go. Also "Can I get a doggy bag?" for leftovers.',
    ctx_pt: 'Pedir para viagem. Também "Can I get a doggy bag?" se sobrar comida.'
  }, {
    en: "Is this dish spicy?",
    fon: "Is dis dish spáisi?",
    ctx_es: "Preguntá si pica antes de pedir.",
    ctx_en: "Ask if the dish is spicy before ordering.",
    ctx_pt: "Pergunte se o prato é apimentado antes de pedir."
  }, {
    en: "Can you make it without onions / gluten?",
    fon: "Can yu méik it widáut ányons / glúten?",
    ctx_es: "Para pedir sin un ingrediente. Muy habitual, los mozos están acostumbrados.",
    ctx_en: "To order without an ingredient. Very common — waiters are used to it.",
    ctx_pt: "Para pedir sem um ingrediente. Muito comum — os garçons estão acostumados."
  }, {
    en: "Can we split the check?",
    fon: "Can ui split de chek?",
    ctx_es: 'Dividir la cuenta entre varios. También "separate checks" si quieren pagar individualmente.',
    ctx_en: 'Split the bill. Also "separate checks" if everyone wants to pay individually.',
    ctx_pt: 'Dividir a conta. Também "separate checks" se cada um quiser pagar o seu.'
  }, {
    en: "Keep the change.",
    fon: "Kip de chéinch.",
    ctx_es: "Decirle que se quede con el vuelto como propina. Solo en efectivo.",
    ctx_en: "Tell them to keep the change as a tip. Cash only.",
    ctx_pt: "Dizer que pode ficar com o troco como gorjeta. Apenas em dinheiro."
  }, {
    en: "Could I get a refill, please?",
    fon: "Kud ái guet a rifíl, plís?",
    ctx_es: "En muchos restaurantes US, los refills de bebidas sin alcohol son gratis e ilimitados.",
    ctx_en: "In many US restaurants, non-alcoholic drink refills are free and unlimited.",
    ctx_pt: "Em muitos restaurantes nos EUA, refils de bebidas não alcoólicas são gratuitos e ilimitados."
  }, {
    en: "Do you have a kids' menu?",
    fon: "Du yu jav a kids méniu?",
    ctx_es: "Preguntá por el menú infantil, suele ser más barato y con porciones chicas.",
    ctx_en: "Ask for the kids' menu — usually cheaper with smaller portions.",
    ctx_pt: "Pergunte pelo cardápio infantil — normalmente mais barato e com porções menores."
  }, {
    en: "We have a reservation under [nombre].",
    fon: "Ui jav a réservéishon ánder [nombre].",
    ctx_es: "Al llegar a un restaurante donde reservaste.",
    ctx_en: "When arriving at a restaurant where you made a reservation.",
    ctx_pt: "Ao chegar a um restaurante onde você fez reserva."
  }, {
    en: "Excuse me, we've been waiting for a while.",
    fon: "Ekskiús mi, uiv bin uéiting for a uáil.",
    ctx_es: "Si el servicio tarda demasiado, es válido llamar la atención educadamente.",
    ctx_en: "If the service is taking too long, it's fine to politely get their attention.",
    ctx_pt: "Se o serviço está demorando muito, é válido chamar a atenção educadamente."
  }, {
    en: "No ice, please.",
    fon: "Nóu áis, plís.",
    ctx_es: "En US ponen MUCHO hielo en todo. Aclaralo si no querés.",
    ctx_en: "US restaurants put A LOT of ice in everything. Say this if you don't want it.",
    ctx_pt: "Nos EUA colocam MUITO gelo em tudo. Deixe claro se não quiser."
  } ]
}, {
  id: "hotel",
  emoji: "🏨",
  label: "Hotel",
  frases: [ {
    en: "I have a reservation under [nombre].",
    fon: "Ái jav a réservéishon ánder [nombre].",
    ctx_es: "Al hacer check-in.",
    ctx_en: "When checking in at the front desk.",
    ctx_pt: "Ao fazer check-in na recepção."
  }, {
    en: "Is early check-in / late check-out possible?",
    fon: "Is érli chek-in / léit chek-áut pósibel?",
    ctx_es: "Preguntá si podés entrar antes o salir después del horario estándar.",
    ctx_en: "Ask if you can check in early or check out later than the standard time.",
    ctx_pt: "Pergunte se pode fazer check-in antes ou check-out depois do horário padrão."
  }, {
    en: "Can I get a room with a view?",
    fon: "Can ái guet a rum uid a viú?",
    ctx_es: "Pedir habitación con vista. No siempre cuesta más.",
    ctx_en: "Request a room with a view. It doesn't always cost extra.",
    ctx_pt: "Pedir quarto com vista. Nem sempre custa mais."
  }, {
    en: "The air conditioning isn't working.",
    fon: "Di éir kondíshoning ísnt uérking.",
    ctx_es: "Reportar que el aire no funciona. También sirve para calefacción, agua caliente, etc.",
    ctx_en: "Report that the AC isn't working. Also works for heating, hot water, etc.",
    ctx_pt: "Reportar que o ar-condicionado não funciona. Também serve para aquecimento, água quente, etc."
  }, {
    en: "Could I get extra towels / pillows?",
    fon: "Kud ái guet éxtra táuels / pílous?",
    ctx_es: "Pedir toallas o almohadas extra a housekeeping.",
    ctx_en: "Request extra towels or pillows from housekeeping.",
    ctx_pt: "Pedir toalhas ou travesseiros extras para a limpeza."
  }, {
    en: "Can I get a wake-up call at 7 AM?",
    fon: "Can ái guet a uéik-ap kol at séven éi em?",
    ctx_es: "Pedir que te llamen por teléfono para despertarte.",
    ctx_en: "Ask to be called by phone as a wake-up alarm.",
    ctx_pt: "Pedir para ser acordado por telefone."
  }, {
    en: "Is breakfast included?",
    fon: "Is brékfast inklúded?",
    ctx_es: "Preguntá antes de bajar al desayuno si es parte de la tarifa o tiene costo extra.",
    ctx_en: "Ask before heading to breakfast whether it's included or costs extra.",
    ctx_pt: "Pergunte antes de descer para o café da manhã se está incluído ou tem custo extra."
  }, {
    en: "What time is checkout?",
    fon: "Uat táim is chék-áut?",
    ctx_es: "Horario estándar de salida, generalmente 11am o 12pm.",
    ctx_en: "Standard checkout time is usually 11am or 12pm.",
    ctx_pt: "O horário padrão de saída geralmente é 11h ou 12h."
  }, {
    en: "Can you store my luggage?",
    fon: "Can yu stór mai lúgach?",
    ctx_es: "Para dejar las valijas antes del check-in o después del check-out.",
    ctx_en: "To leave your bags before check-in or after check-out.",
    ctx_pt: "Para deixar as malas antes do check-in ou depois do check-out."
  }, {
    en: "The Wi-Fi password isn't working.",
    fon: "De uáifai pásword ísnt uérking.",
    ctx_es: "Para pedir el password correcto o reportar que la conexión no anda.",
    ctx_en: "To get the correct password or report that the connection isn't working.",
    ctx_pt: "Para pedir a senha correta ou reportar que a conexão não está funcionando."
  } ]
}, {
  id: "transporte",
  emoji: "🚕",
  label: "Transporte",
  frases: [ {
    en: "Can you take me to this address?",
    fon: "Can yu téik mi tu dis ádrés?",
    ctx_es: "Mostrá la pantalla del mapa al taxista si no pronunciás bien la dirección.",
    ctx_en: "Show the map screen to the driver if you can't pronounce the address clearly.",
    ctx_pt: "Mostre a tela do mapa ao motorista se não souber pronunciar o endereço."
  }, {
    en: "How long will it take to get there?",
    fon: "Jáu long uil it téik tu guet dér?",
    ctx_es: "Preguntar tiempo estimado de viaje.",
    ctx_en: "Ask for the estimated travel time.",
    ctx_pt: "Perguntar o tempo estimado de viagem."
  }, {
    en: "Could you slow down, please?",
    fon: "Kud yu slóu dáun, plís?",
    ctx_es: "Si el conductor maneja muy rápido.",
    ctx_en: "If the driver is going too fast.",
    ctx_pt: "Se o motorista estiver indo rápido demais."
  }, {
    en: "Please turn on the meter.",
    fon: "Plís térn on de míter.",
    ctx_es: "En taxis formales, el taxímetro debe estar encendido siempre.",
    ctx_en: "In formal taxis, the meter should always be running.",
    ctx_pt: "Em táxis formais, o taxímetro deve estar sempre ligado."
  }, {
    en: "Keep the change.",
    fon: "Kip de chéinch.",
    ctx_es: "Dejá el vuelto como propina al taxista.",
    ctx_en: "Leave the change as a tip for the driver.",
    ctx_pt: "Deixe o troco como gorjeta para o motorista."
  }, {
    en: "Where do I catch the subway / bus to [lugar]?",
    fon: "Wér du ái kach de sábuei / bos tu [lugar]?",
    ctx_es: "Para orientarte en transporte público.",
    ctx_en: "To get directions on public transit.",
    ctx_pt: "Para se orientar no transporte público."
  }, {
    en: "Does this bus go to downtown?",
    fon: "Das dis bos góu tu dáuntaun?",
    ctx_es: "Para confirmar el recorrido del colectivo.",
    ctx_en: "To confirm the bus route.",
    ctx_pt: "Para confirmar o trajeto do ônibus."
  }, {
    en: "Could you drop me off here?",
    fon: "Kud yu drop mi of jíer?",
    ctx_es: "Pedirle al conductor que te deje en ese punto.",
    ctx_en: "Ask the driver to let you out at that spot.",
    ctx_pt: "Pedir ao motorista que pare naquele ponto."
  }, {
    en: "Is there a toll on this route?",
    fon: "Is dér a tóul on dis rúut?",
    ctx_es: "Preguntá si hay peajes. Importante al alquilar auto.",
    ctx_en: "Ask if there are tolls on the route. Important when renting a car.",
    ctx_pt: "Pergunte se há pedágios. Importante ao alugar carro."
  }, {
    en: "Where is the nearest gas station?",
    fon: "Wér is de nírest gas stéishon?",
    ctx_es: "Para encontrar una estación de servicio.",
    ctx_en: "To find the nearest gas station.",
    ctx_pt: "Para encontrar o posto de gasolina mais próximo."
  } ]
}, {
  id: "emergencia",
  emoji: "🚨",
  label: "Emergencias",
  frases: [ {
    en: "Call 911!",
    fon: "Kol náin uan uan!",
    ctx_es: "El número de emergencias en US. Equivale a nuestro 911 (coincide). Policía, bomberos, ambulancia.",
    ctx_en: "The US emergency number. Police, fire, ambulance — all reached at 911.",
    ctx_pt: "O número de emergências nos EUA. Polícia, bombeiros, ambulância — tudo pelo 911."
  }, {
    en: "I need a doctor.",
    fon: "Ái níd a dóktor.",
    ctx_es: 'Pedí ayuda médica. En US los "urgent care" son más rápidos y baratos que la guardia de hospital.',
    ctx_en: 'Ask for medical help. "Urgent care" clinics are faster and cheaper than ER.',
    ctx_pt: 'Peça ajuda médica. Clínicas "urgent care" são mais rápidas e baratas que a emergência.'
  }, {
    en: "I've been robbed.",
    fon: "Áiv bin robd.",
    ctx_es: "Denunciar un robo. Necesitás el reporte policial para el seguro de viaje.",
    ctx_en: "Report a robbery. You'll need the police report for your travel insurance.",
    ctx_pt: "Denunciar um roubo. Você precisará do boletim de ocorrência para o seguro viagem."
  }, {
    en: "I lost my passport / wallet.",
    fon: "Ái lost mai pásport / uólet.",
    ctx_es: "Reportar pérdida. El consulado argentino puede emitir un documento de emergencia.",
    ctx_en: "Report a loss. The Argentine consulate can issue an emergency travel document.",
    ctx_pt: "Reportar perda. O consulado pode emitir um documento de emergência."
  }, {
    en: "I have an allergic reaction.",
    fon: "Ái jav an alérchik riákshon.",
    ctx_es: "Reacción alérgica. Si es grave pedí una EpiPen en urgencias.",
    ctx_en: "Allergic reaction. If severe, ask for an EpiPen at the emergency room.",
    ctx_pt: "Reação alérgica. Se grave, peça uma EpiPen na emergência."
  }, {
    en: "I need an interpreter.",
    fon: "Ái níd an intérpreter.",
    ctx_es: "Por ley los hospitales y dependencias públicas deben proveer uno gratis.",
    ctx_en: "By law, hospitals and public offices must provide a free interpreter.",
    ctx_pt: "Por lei, hospitais e órgãos públicos devem fornecer um intérprete gratuito."
  }, {
    en: "Where is the nearest emergency room?",
    fon: "Wér is de nírest emérchenci rum?",
    ctx_es: "Guardia de hospital más cercana.",
    ctx_en: "The nearest hospital emergency room.",
    ctx_pt: "A emergência do hospital mais próximo."
  }, {
    en: "I have travel insurance. Here is my card.",
    fon: "Ái jav trável inshúrans. Jíer is mai kard.",
    ctx_es: "Siempre tené a mano los datos del seguro antes de que te atiendan.",
    ctx_en: "Always have your insurance info ready before they start treating you.",
    ctx_pt: "Tenha sempre os dados do seguro em mãos antes de ser atendido."
  }, {
    en: "My medication was stolen / lost.",
    fon: "Mái medikéishon uos stólen / lost.",
    ctx_es: "Para que el médico pueda recetarte de vuelta. Tené el nombre genérico del medicamento.",
    ctx_en: "So the doctor can prescribe again. Have the generic name of your medication ready.",
    ctx_pt: "Para o médico poder prescrever novamente. Tenha o nome genérico do medicamento."
  }, {
    en: "I feel dizzy and I can't breathe well.",
    fon: "Ái fíl dísi and ái kant bríd uel.",
    ctx_es: "Síntomas físicos importantes para comunicar en urgencias.",
    ctx_en: "Important physical symptoms to communicate in the emergency room.",
    ctx_pt: "Sintomas físicos importantes para comunicar na emergência."
  } ]
}, {
  id: "aeropuerto",
  emoji: "✈️",
  label: "Aeropuerto",
  frases: [ {
    en: "I'm here on vacation / business.",
    fon: "Áim jíer on vaqueishon / bísnes.",
    ctx_es: "Lo primero que te pregunta Migraciones al entrar a US.",
    ctx_en: "The first thing US Immigration asks when you enter.",
    ctx_pt: "A primeira coisa que a Imigração pergunta ao entrar nos EUA."
  }, {
    en: "I'll be staying for [X] days.",
    fon: "Áil bi stéying for [X] déis.",
    ctx_es: "Decirle cuántos días vas a estar.",
    ctx_en: "Tell them how many days you'll be staying.",
    ctx_pt: "Diga quantos dias você vai ficar."
  }, {
    en: "I'm staying at [hotel / dirección].",
    fon: "Áim stéying at [hotel].",
    ctx_es: "La dirección de donde te hospedás. Tenela anotada antes de llegar.",
    ctx_en: "The address where you're staying. Have it written down before you arrive.",
    ctx_pt: "O endereço onde você vai se hospedar. Tenha anotado antes de chegar."
  }, {
    en: "I have nothing to declare.",
    fon: "Ái jav náding tu deklér.",
    ctx_es: "En Aduana si no traés productos que superen el límite permitido.",
    ctx_en: "At Customs if you're not carrying goods above the allowed limit.",
    ctx_pt: "Na Alfândega se você não está trazendo produtos acima do limite permitido."
  }, {
    en: "My flight was delayed / cancelled.",
    fon: "Mái fláit uos diléid / kánseld.",
    ctx_es: "Para reclamar en el mostrador o con la aerolínea.",
    ctx_en: "To make a claim at the counter or with the airline.",
    ctx_pt: "Para reclamar no balcão ou com a companhia aérea."
  }, {
    en: "I missed my connecting flight.",
    fon: "Ái misd mái konékting fláit.",
    ctx_es: "Si perdiste la conexión, dirigite al mostrador de tu aerolínea inmediatamente.",
    ctx_en: "If you missed a connection, go to your airline's counter immediately.",
    ctx_pt: "Se você perdeu a conexão, vá imediatamente ao balcão da sua companhia aérea."
  }, {
    en: "Where do I pick up my luggage?",
    fon: "Wér du ái pik ap mái lúgach?",
    ctx_es: "Preguntar por la cinta de equipaje.",
    ctx_en: "Ask where the baggage carousel is.",
    ctx_pt: "Perguntar onde fica a esteira de bagagem."
  }, {
    en: "My bag didn't arrive.",
    fon: "Mái bag dídn't aráiv.",
    ctx_es: "Para reportar equipaje perdido. Hacelo antes de salir del aeropuerto.",
    ctx_en: "To report lost luggage. Do it before leaving the airport.",
    ctx_pt: "Para reportar bagagem perdida. Faça isso antes de sair do aeroporto."
  }, {
    en: "Is there a shuttle to the hotel?",
    fon: "Is dér a shátl tu de joutél?",
    ctx_es: "Muchos hoteles tienen traslado gratuito desde el aeropuerto. Preguntá.",
    ctx_en: "Many hotels offer a free shuttle from the airport. Always ask.",
    ctx_pt: "Muitos hotéis oferecem traslado gratuito do aeroporto. Sempre pergunte."
  }, {
    en: "Where is the TSA PreCheck / Global Entry lane?",
    fon: "Wér is de tíeséi préchek / glóbal éntri léin?",
    ctx_es: "Si tenés preaprobación, tiene fila separada y más rápida.",
    ctx_en: "If you're pre-approved, there's a separate, faster lane.",
    ctx_pt: "Se você tem pré-aprovação, há uma fila separada e mais rápida."
  } ]
} ];

const ABREVIATURAS = [ {
  abbr: "BOGO",
  sig: "Buy One Get One",
  uso_es: "Comprás uno y te llevan otro gratis (o a mitad de precio). Muy común en CVS, Walgreens, supermercados.",
  uso_en: "Buy one, get one free (or half price). Very common at CVS, Walgreens, and grocery stores.",
  uso_pt: "Compre um, leve outro grátis (ou pela metade do preço). Muito comum em CVS, Walgreens e supermercados."
}, {
  abbr: "OOS",
  sig: "Out Of Stock",
  uso_es: "Sin stock. Lo vas a ver en apps y webs cuando el producto no está disponible.",
  uso_en: "No stock available. You'll see this in apps and websites when a product is unavailable.",
  uso_pt: "Sem estoque. Você verá isso em apps e sites quando o produto não está disponível."
}, {
  abbr: "MSRP",
  sig: "Manufacturer's Suggested Retail Price",
  uso_es: 'Precio sugerido por el fabricante. El precio "de lista" antes de descuentos.',
  uso_en: 'The manufacturer\'s suggested retail price — the "sticker price" before any discounts.',
  uso_pt: 'Preço sugerido pelo fabricante. O preço "de tabela" antes dos descontos.'
}, {
  abbr: "EBT",
  sig: "Electronic Benefit Transfer",
  uso_es: "Tarjeta de asistencia alimentaria del gobierno. Algunas tiendas tienen filas especiales.",
  uso_en: "Government food assistance card. Some stores have dedicated checkout lanes for it.",
  uso_pt: "Cartão de assistência alimentar do governo. Algumas lojas têm filas especiais para isso."
}, {
  abbr: "FSA / HSA",
  sig: "Flexible / Health Savings Account",
  uso_es: 'Cuentas de ahorro para gastos médicos. Si ves "FSA Eligible" en un producto, lo podés pagar con esa cuenta.',
  uso_en: 'Health savings accounts. If you see "FSA Eligible" on a product, you can pay with that account.',
  uso_pt: 'Contas de poupança para despesas médicas. Se você ver "FSA Eligible" em um produto, pode pagar com essa conta.'
}, {
  abbr: "SKU",
  sig: "Stock Keeping Unit",
  uso_es: "Código interno del producto. Si necesitás algo puntual, preguntá el SKU para que lo busquen rápido.",
  uso_en: "Internal product code. If you need a specific item, ask for the SKU so they can find it quickly.",
  uso_pt: "Código interno do produto. Se precisar de algo específico, pergunte o SKU para agilizar a busca."
}, {
  abbr: "ROI",
  sig: "Return On Investment",
  uso_es: "Retorno sobre la inversión. Lo vas a escuchar mucho en contextos de negocios o compras grandes.",
  uso_en: "Return on investment. You'll hear this a lot in business contexts or big purchase decisions.",
  uso_pt: "Retorno sobre o investimento. Você vai ouvir muito em contextos de negócios ou compras grandes."
}, {
  abbr: "COD",
  sig: "Cash On Delivery",
  uso_es: "Pago al recibir el pedido. Cada vez menos común en US.",
  uso_en: "Pay when your order arrives. Increasingly rare in the US.",
  uso_pt: "Pagamento ao receber o pedido. Cada vez menos comum nos EUA."
}, {
  abbr: "ETA",
  sig: "Estimated Time of Arrival",
  uso_es: "Hora o fecha estimada de llegada. Para pedidos online o coordinar llegadas.",
  uso_en: "Estimated arrival time or date. Used for online orders or coordinating meetups.",
  uso_pt: "Hora ou data estimada de chegada. Para pedidos online ou coordenar chegadas."
}, {
  abbr: "IYKYK",
  sig: "If You Know You Know",
  uso_es: "Si lo sabés, lo sabés. Se usa para referencias internas o chistes que no todos entienden.",
  uso_en: "If you know, you know. Used for inside references or jokes not everyone gets.",
  uso_pt: "Se você sabe, você sabe. Usado para referências internas ou piadas que nem todos entendem."
}, {
  abbr: "TBH",
  sig: "To Be Honest",
  uso_es: 'Para ser honesto. "TBH the food was mid" = siendo honesto, la comida fue mediocre.',
  uso_en: 'To be honest. "TBH the food was mid" = honestly, the food was just okay.',
  uso_pt: 'Para ser honesto. "TBH the food was mid" = sendo honesto, a comida foi mediana.'
}, {
  abbr: "NGL",
  sig: "Not Gonna Lie",
  uso_es: "No te voy a mentir. Similar a TBH, para confesar algo.",
  uso_en: "Not gonna lie. Similar to TBH — used to admit something candidly.",
  uso_pt: "Não vou mentir. Similar ao TBH — usado para confessar algo."
}, {
  abbr: "IMO / IMHO",
  sig: "In My Opinion / In My Humble Opinion",
  uso_es: "En mi opinión. Muy común en foros y reviews de productos.",
  uso_en: "In my opinion. Very common in forums and product reviews.",
  uso_pt: "Na minha opinião. Muito comum em fóruns e avaliações de produtos."
}, {
  abbr: "SMH",
  sig: "Shaking My Head",
  uso_es: 'Moviendo la cabeza (incredulidad o decepción). "They charged me twice, SMH."',
  uso_en: 'Shaking my head — disbelief or disappointment. "They charged me twice, SMH."',
  uso_pt: 'Balançando a cabeça (incredulidade ou decepção). "They charged me twice, SMH."'
}, {
  abbr: "LMK",
  sig: "Let Me Know",
  uso_es: 'Avisame. "LMK if you need help" = avisame si necesitás ayuda.',
  uso_en: 'Let me know. "LMK if you need help" = tell me if you need anything.',
  uso_pt: 'Me avise. "LMK if you need help" = me avise se precisar de ajuda.'
}, {
  abbr: "BRB",
  sig: "Be Right Back",
  uso_es: "Ya vuelvo. En chats o si tenés que alejarte un momento.",
  uso_en: "Be right back. Used in chats or when stepping away briefly.",
  uso_pt: "Já volto. Usado em chats ou quando você precisa se ausentar por um momento."
}, {
  abbr: "AFK",
  sig: "Away From Keyboard",
  uso_es: "Ausente / no disponible temporalmente.",
  uso_en: "Away from keyboard — temporarily unavailable.",
  uso_pt: "Ausente / temporariamente indisponível."
}, {
  abbr: "DM",
  sig: "Direct Message",
  uso_es: 'Mensaje privado en redes. "Slide into my DMs" = mandame un mensaje privado.',
  uso_en: 'Private message on social media. "Slide into my DMs" = send me a private message.',
  uso_pt: 'Mensagem privada nas redes. "Slide into my DMs" = me manda uma mensagem privada.'
}, {
  abbr: "FYI",
  sig: "For Your Information",
  uso_es: "Para tu información. Se usa para compartir algo relevante sin pedir respuesta.",
  uso_en: "For your information. Used to share something relevant without expecting a reply.",
  uso_pt: "Para sua informação. Usado para compartilhar algo relevante sem esperar resposta."
}, {
  abbr: "ASAP",
  sig: "As Soon As Possible",
  uso_es: "Lo antes posible. Muy común en trabajo y pedidos.",
  uso_en: "As soon as possible. Very common at work and for orders.",
  uso_pt: "O mais rápido possível. Muito comum no trabalho e em pedidos."
}, {
  abbr: "EOM",
  sig: "End Of Message",
  uso_es: "Fin del mensaje. Lo usás en emails cuando el asunto ya lo dice todo y el cuerpo queda vacío.",
  uso_en: "End of message. Used in emails when the subject line says it all and the body is left empty.",
  uso_pt: "Fim da mensagem. Usado em e-mails quando o assunto já diz tudo e o corpo fica vazio."
}, {
  abbr: "TSA",
  sig: "Transportation Security Administration",
  uso_es: "Seguridad aeroportuaria de US. Los que revisan las valijas y te hacen sacar los zapatos.",
  uso_en: "US airport security. The agents who screen your bags and make you remove your shoes.",
  uso_pt: "Segurança aeroportuária dos EUA. Os agentes que revistam as malas e pedem para tirar os sapatos."
}, {
  abbr: "CBP",
  sig: "Customs and Border Protection",
  uso_es: "Aduana y control de fronteras. Los que te sellan el pasaporte al entrar.",
  uso_en: "Customs and border control. The officers who stamp your passport on entry.",
  uso_pt: "Aduana e controle de fronteiras. Os agentes que carimbam seu passaporte na entrada."
}, {
  abbr: "DHS",
  sig: "Department of Homeland Security",
  uso_es: "Seguridad nacional, el ministerio que supervisa TSA, CBP e inmigración.",
  uso_en: "Homeland security — the department that oversees TSA, CBP, and immigration.",
  uso_pt: "Segurança nacional — o ministério que supervisiona TSA, CBP e imigração."
}, {
  abbr: "ETA / ESTA",
  sig: "Electronic System for Travel Authorization",
  uso_es: "El permiso electrónico que necesitan los argentinos para entrar a US sin visa (hasta 90 días).",
  uso_en: "The electronic authorization Argentines need to enter the US without a visa (up to 90 days).",
  uso_pt: "A autorização eletrônica que argentinos precisam para entrar nos EUA sem visto (até 90 dias)."
}, {
  abbr: "TSA PreCheck",
  sig: "TSA Pre-Check",
  uso_es: "Programa de preaprobación de seguridad. Fila más rápida en aeropuertos, no sacás laptops ni zapatos.",
  uso_en: "Pre-approved security program. Faster airport lane — no need to remove laptops or shoes.",
  uso_pt: "Programa de pré-aprovação de segurança. Fila mais rápida — sem tirar laptop ou sapatos."
}, {
  abbr: "LAX / JFK / ORD / MIA",
  sig: "Códigos IATA de aeropuertos",
  uso_es: "LAX=Los Ángeles, JFK=New York, ORD=Chicago O'Hare, MIA=Miami. Siempre aparecen en los pasajes.",
  uso_en: "LAX=Los Angeles, JFK=New York, ORD=Chicago O'Hare, MIA=Miami. Always on your tickets.",
  uso_pt: "LAX=Los Angeles, JFK=Nova York, ORD=Chicago O'Hare, MIA=Miami. Sempre aparecem nas passagens."
}, {
  abbr: "OAK / SFO",
  sig: "Aeropuertos de Bay Area",
  uso_es: "OAK=Oakland, SFO=San Francisco. Son diferentes aeropuertos, ojo con cuál reservás.",
  uso_en: "OAK=Oakland, SFO=San Francisco. They're different airports — watch which one you book.",
  uso_pt: "OAK=Oakland, SFO=San Francisco. São aeroportos diferentes — atenção ao reservar."
}, {
  abbr: "PNR",
  sig: "Passenger Name Record",
  uso_es: "El código de reserva de tu vuelo. Lo necesitás para hacer el check-in online.",
  uso_en: "Your flight booking code. You'll need it to check in online.",
  uso_pt: "O código de reserva do seu voo. Você vai precisar dele para fazer check-in online."
}, {
  abbr: "OTC",
  sig: "Over The Counter",
  uso_es: "Sin receta. Medicamentos que podés comprar libremente en cualquier farmacia.",
  uso_en: "No prescription needed. Medications you can buy freely at any pharmacy.",
  uso_pt: "Sem receita. Medicamentos que você pode comprar livremente em qualquer farmácia."
}, {
  abbr: "RX",
  sig: "Prescription (Receta médica)",
  uso_es: "Medicamento que requiere receta. Lo verás en farmacias para indicar que necesitás prescripción.",
  uso_en: "Prescription-only medication. You'll see this at pharmacies to indicate a prescription is required.",
  uso_pt: "Medicamento que exige receita. Você verá isso em farmácias indicando que precisa de prescrição."
}, {
  abbr: "ER / ED",
  sig: "Emergency Room / Emergency Department",
  uso_es: "Guardia de hospital. Muy caro sin seguro — si podés, usá un Urgent Care en su lugar.",
  uso_en: "Hospital emergency room. Very expensive without insurance — use Urgent Care if you can.",
  uso_pt: "Pronto-socorro do hospital. Muito caro sem seguro — use um Urgent Care se possível."
}, {
  abbr: "MD / DO",
  sig: "Medical Doctor / Doctor of Osteopathy",
  uso_es: "Ambos son médicos reconocidos en US. DO tiene formación adicional en medicina holística.",
  uso_en: "Both are recognized physicians in the US. DOs have additional training in holistic medicine.",
  uso_pt: "Ambos são médicos reconhecidos nos EUA. DO tem formação adicional em medicina holística."
}, {
  abbr: "ICU",
  sig: "Intensive Care Unit",
  uso_es: "Unidad de terapia intensiva (UTI).",
  uso_en: "Intensive care unit — equivalent to UTI in Spanish-speaking countries.",
  uso_pt: "Unidade de terapia intensiva (UTI)."
}, {
  abbr: "BP",
  sig: "Blood Pressure",
  uso_es: "Presión arterial. Te lo van a preguntar en cualquier consulta médica.",
  uso_en: "Blood pressure. They'll check this at every medical appointment.",
  uso_pt: "Pressão arterial. Vão verificar isso em qualquer consulta médica."
}, {
  abbr: "BYOB",
  sig: "Bring Your Own Bottle / Beer",
  uso_es: 'Restaurante que te permite llevar tu propia bebida alcohólica (y solo te cobran el "corkage fee").',
  uso_en: "Restaurant that lets you bring your own alcohol (they may charge a corkage fee).",
  uso_pt: "Restaurante que permite trazer sua própria bebida alcoólica (podem cobrar uma taxa de rolha)."
}, {
  abbr: "prix fixe",
  sig: "Menú a precio fijo (del francés)",
  uso_es: "Menú cerrado con entrada, plato y postre a un precio único. Muy común en restaurantes finos.",
  uso_en: "Fixed-price menu with starter, main, and dessert at one price. Common in fine dining.",
  uso_pt: "Menu fechado com entrada, prato e sobremesa por um preço único. Comum em restaurantes finos."
}, {
  abbr: "APR",
  sig: "Annual Percentage Rate",
  uso_es: "Tasa de interés anual. Lo verás en ofertas de tarjetas de crédito y préstamos.",
  uso_en: "Annual interest rate. You'll see this on credit card and loan offers.",
  uso_pt: "Taxa de juros anual. Você verá isso em ofertas de cartão de crédito e empréstimos."
}, {
  abbr: "FICO",
  sig: "Fair Isaac Corporation (score crediticio)",
  uso_es: "El puntaje de crédito en US. Sin historial argentino, arrancás desde cero.",
  uso_en: "The US credit score system. Without US credit history, you start from scratch.",
  uso_pt: "O sistema de pontuação de crédito nos EUA. Sem histórico americano, você começa do zero."
}, {
  abbr: "ACH",
  sig: "Automated Clearing House",
  uso_es: "Sistema de transferencias bancarias en US, equivalente a una transferencia bancaria local.",
  uso_en: "US bank transfer system — equivalent to a standard wire transfer.",
  uso_pt: "Sistema de transferências bancárias nos EUA, equivalente a uma transferência bancária local."
} ];

const FRASES_CAT_LABELS = {
  es: {
    shopping: "Shopping",
    restaurante: "Restaurante",
    hotel: "Hotel",
    transporte: "Transporte",
    emergencia: "Emergencias",
    aeropuerto: "Aeropuerto"
  },
  en: {
    shopping: "Shopping",
    restaurante: "Restaurant",
    hotel: "Hotel",
    transporte: "Transport",
    emergencia: "Emergencies",
    aeropuerto: "Airport"
  },
  pt: {
    shopping: "Shopping",
    restaurante: "Restaurante",
    hotel: "Hotel",
    transporte: "Transporte",
    emergencia: "Emergências",
    aeropuerto: "Aeroporto"
  }
};

let frasesActiveCat = "shopping";

let frasesActiveSection = "frases";

function frasesRender() {
  const body = document.getElementById("frases-body");
  if (!body) return;
  const lang = localStorage.getItem("appLang") || "es";
  const t = i18n[lang] || i18n.es;
  const catLabels = FRASES_CAT_LABELS[lang] || FRASES_CAT_LABELS.es;
  let html = `<div class="frases-cat-tabs" style="margin-bottom:12px;">\n        <button class="frases-tab${frasesActiveSection === "frases" ? " active" : ""}" onclick="frasesSetSection('frases')">${t.frases_tab_frases}</button>\n        <button class="frases-tab${frasesActiveSection === "abrev" ? " abrev-active" : ""}" onclick="frasesSetSection('abrev')">${t.frases_tab_abrev}</button>\n    </div>`;
  if (frasesActiveSection === "frases") {
    html += `<div class="frases-cat-tabs">`;
    FRASES_CATS.forEach(cat => {
      const active = cat.id === frasesActiveCat ? " active" : "";
      const label = catLabels[cat.id] || cat.label;
      html += `<button class="frases-tab${active}" onclick="frasesSetCat('${cat.id}')">${cat.emoji} ${label}</button>`;
    });
    html += `</div>`;
    const cat = FRASES_CATS.find(c => c.id === frasesActiveCat);
    if (cat) {
      const label = catLabels[cat.id] || cat.label;
      html += `<div class="frases-section-label">${cat.emoji} ${label}</div>`;
      const ctxKey = lang === "en" ? "ctx_en" : lang === "pt" ? "ctx_pt" : "ctx_es";
      cat.frases.forEach(f => {
        html += `<div class="frase-card">\n                    <div class="frase-en">"${f.en}"</div>\n                    <div class="frase-fonetica">${t.frases_fonetica_label} ${f.fon}</div>\n                    <div class="frase-ctx">${t.frases_ctx_label} ${f[ctxKey] || f.ctx_es}</div>\n                </div>`;
      });
    }
  } else {
    html += `<div class="frases-section-label">${t.frases_section_abrev}</div>`;
    const usoKey = lang === "en" ? "uso_en" : lang === "pt" ? "uso_pt" : "uso_es";
    ABREVIATURAS.forEach(a => {
      html += `<div class="abrev-card">\n                <div class="abrev-tag">${a.abbr}</div>\n                <div class="abrev-info">\n                    <div class="abrev-significado">${a.sig}</div>\n                    <div class="abrev-uso">${a[usoKey] || a.uso_es}</div>\n                </div>\n            </div>`;
    });
  }
  body.innerHTML = html;
}

window.frasesRender = frasesRender;

window.frasesSetSection = function(sec) {
  frasesActiveSection = sec;
  frasesRender();
};

window.frasesSetCat = function(cat) {
  frasesActiveCat = cat;
  frasesRender();
};

document.addEventListener("DOMContentLoaded", () => {
  farmaInitCats();
  farmaRender(FARMA_DATA);
  frasesRender();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

sessionStorage.setItem("taxfly_last_page", "./unidades.html");

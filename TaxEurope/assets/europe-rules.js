(function(root){
const checkedAt='2026-10-02';
const general='https://europa.eu/youreurope/citizens/consumers/shopping/vat/index_en.htm';
const refunds={
 ES:{verified:true,minimum:0,strict:false,basis:'gross',deadline:'month3',territory:'Península y Baleares',system:'DIVA / DER',source:'https://sede.agenciatributaria.gob.es/Sede/viajeros-trabajadores-desplazados-fronterizos/devoluciones-iva-compras-viajeros/informacion-general-sobre-devolucion-iva-viajeros.html',note:'Bienes de uso personal. Canarias, Ceuta y Melilla requieren otros regímenes. Solicitá el DER en la compra y validalo al salir del territorio IVA de la UE.'},
 FR:{verified:true,minimum:100,strict:true,basis:'gross',deadline:'month3',age:16,maxStayMonths:6,system:'PABLO',source:'https://www.douane.gouv.fr/demarche/vous-achetez-des-marchandises-en-detaxe',note:'Más de EUR 100 con impuestos, en una misma enseña o agrupación adherida durante un máximo de 3 días. Edad mínima 16 y visita inferior a 6 meses. El comercio debe aceptar el régimen.'},
 IT:{verified:true,minimum:70,strict:true,basis:'gross',deadline:'month3',system:'OTELLO',source:'https://www.adm.gov.it/portale/rimborso-iva',note:'Más de EUR 70 por factura. Bienes para uso personal y residencia habitual fuera de la UE. Validación OTELLO; devolver la factura validada al vendedor dentro de los cuatro meses siguientes al mes de compra.'},
 DE:{verified:true,minimum:50,strict:true,basis:'gross',deadline:'month3',system:'Certificación de exportación',source:'https://www.zoll.de/EN/Private-individuals/Travel/Leaving-Germany/Tax-free-shopping/tax-free-shopping_node.html',note:'Más de EUR 50 por entrega, IVA incluido. La aduana acredita la exportación; el reembolso se solicita al comercio u operador.'},
 PT:{verified:true,ambiguousMinimum:true,minimum:50,strict:true,basis:'net',deadline:'month3',system:'e-Taxfree Portugal',source:'https://info.portaldasfinancas.gov.pt/en/tax-information/travellers-and-customs/e-taxfree-vat-refund-for-tourists/Pages/default.aspx',note:'La guía oficial exige más de EUR 50 sin IVA. En el umbral exacto de EUR 50 netos hay diferencias de redacción entre páginas oficiales: confirmá con el comercio. Sistema electrónico si la salida de la UE es por Portugal.'},
 NL:{verified:true,minimum:50,strict:false,basis:'gross',deadline:'month3',system:'NL Customs VAT',source:'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/douane/reisbagage/btw-terugvragen-bij-uitvoer/',note:'Al menos EUR 50. Verificá factura, comercio, residencia y registro digital de las compras cuando salgas de la UE por Países Bajos.'},
 AT:{verified:true,minimum:75,strict:true,basis:'gross',deadline:'month3',system:'DEV / certificado de exportación',source:'https://www.bmf.gv.at/en/topics/customs/travellers/vat-refund.html',note:'Más de EUR 75 por factura. La validación de la salida desde el aeropuerto de Viena utiliza DEV.'},
 BE:{verified:true,minimum:125,strict:true,basis:'gross',deadline:'month3',system:'Certificado / Tax Free Form',source:'https://finances.belgium.be/fr/node/7485',note:'Más de EUR 125 con IVA por factura. Verificá el punto de validación para equipaje facturado en vuelos con conexión.'},
 CH:{verified:true,minimum:300,strict:false,basis:'gross',deadline:'days90',territory:'Suiza',system:'Documento de exportación',source:'https://www.estv.admin.ch/en/tax-free-for-tourists',note:'Al menos CHF 300 con IVA. Residencia fuera de Suiza; exportación dentro de 90 días. No aplicar el plazo de la UE.'},
 GB:{verified:true,disabled:true,system:'Revisar territorio',source:'https://www.gov.uk/tax-on-shopping/taxfree-shopping',note:'En Gran Bretaña no se ofrece el régimen turístico habitual para compras llevadas en el equipaje. Irlanda del Norte tiene requisitos específicos. El envío directo al extranjero es un régimen distinto.'}
};
const tourist=[
 {id:'barcelona',country:'ES',city:'Barcelona',currency:'EUR',validFrom:'2026-04-01',validThrough:'2027-03-31',ageMin:17,cap:7,types:{'5 estrellas':12,'4 estrellas':8.4,'Vivienda turística':9.5,'Albergue juvenil':6,'Otros alojamientos':7},source:'https://atc.gencat.cat/es/tributs/ieet/quota-tributaria/',note:'Total de tasa autonómica y recargo municipal. Estimación sin el tratamiento de IVA que corresponda a la facturación del alojamiento. Máximo 7 unidades de estancia por persona. Si pagaste reserva e impuesto por adelantado, confirmá la tarifa vigente en el momento del pago.'},
 {id:'lisboa',country:'PT',city:'Lisboa',currency:'EUR',validFrom:'2024-09-01',validThrough:'2026-12-31',ageMin:14,cap:7,rate:4,source:'https://informacoeseservicos.lisboa.pt/servicos/detalhe/taxa-municipal-turistica',note:'EUR 4 por huésped y noche, hasta 7 noches. Edad superior a 13 años. Otras exenciones requieren confirmación.'},
 {id:'porto',country:'PT',city:'Oporto',currency:'EUR',validFrom:'2024-12-01',validThrough:'2026-12-31',ageMin:13,cap:7,rate:3,source:'https://comercioturismo.cm-porto.pt/turismo/taxa-municipal-turistica-do-porto',note:'EUR 3 por huésped y noche, hasta 7 noches. Menores de 13 exentos; revisar las restantes exenciones.'},
 {id:'amsterdam',country:'NL',city:'Ámsterdam',currency:'EUR',validFrom:'2026-01-01',validThrough:'2026-12-31',percent:true,rate:12.5,ageMin:0,cap:null,source:'https://www.amsterdam.nl/en/municipal-taxes/tourist-tax/',note:'12,5% del precio del alojamiento sin IVA. Ingresá la base exacta de la reserva. No corresponde a residentes registrados en Ámsterdam; cruceros tienen otras reglas.'}
];
const stores=[
 {name:'Coop',country:'CH',type:'Supermercados',url:'https://www.coop.ch/fr/store-finder?lang=fr'},
 {name:'Migros',country:'CH',type:'Supermercados',url:'https://filialen.migros.ch/fr/'},
 {name:'Esselunga',country:'IT',type:'Supermercados',url:'https://www.esselunga.it/it-it/negozi.html'},
 {name:'Conad',country:'IT',type:'Supermercados',url:'https://www.conad.it/ricerca-negozi'},
 {name:'Tesco',country:'GB',type:'Supermercados',url:'https://www.tesco.com/store-locator/'},
 {name:'BILLA',country:'AT',type:'Supermercados',url:'https://www.billa.at/filialfinder'},
 {name:'Lidl',country:'AT',type:'Supermercados',url:'https://www.lidl.at/c/filialen-und-oeffnungszeiten/s10017229'},
 {name:'Lidl',country:'DE',type:'Supermercados',url:'https://www.lidl.de/s/de-DE/filialen/'},
 {name:'El Corte Inglés',country:'ES',type:'Grandes almacenes',url:'https://www.elcorteingles.es/centroscomerciales/es/eci/centros'},
 {name:'Carrefour',country:'ES',type:'Supermercados',url:'https://www.carrefour.es/tiendas-carrefour/'},
 {name:'Cortefiel',country:'ES',type:'Moda',url:'https://cortefiel.com/es/es/stores'},
 {name:'Las Rozas Village',country:'ES',city:'Madrid',type:'Outlets',url:'https://www.thebicestercollection.com/las-rozas-village/'},
 {name:'La Roca Village',country:'ES',city:'Barcelona',type:'Outlets',url:'https://www.thebicestercollection.com/la-roca-village/'},
 {name:'Galeries Lafayette',country:'FR',type:'Grandes almacenes',url:'https://www.galerieslafayette.com/'},
 {name:'Printemps',country:'FR',type:'Grandes almacenes',url:'https://www.printemps.com/fr/fr/magasins'},
 {name:'La Vallée Village',country:'FR',city:'París',type:'Outlets',url:'https://www.thebicestercollection.com/la-vallee-village/'},
 {name:'Fidenza Village (Fidenza, entre Milán y Bolonia)',country:'IT',type:'Outlets',url:'https://www.thebicestercollection.com/fidenza-village/'},
 {name:'dm',country:'DE',type:'Perfumería y cuidado personal',url:'https://www.dm.de/store'},
 {name:'ROSSMANN',country:'DE',type:'Perfumería y cuidado personal',url:'https://www.rossmann.de/de/filialen/index.html'},
 {name:'Bicester Village',country:'GB',city:'Londres',type:'Outlets',url:'https://www.thebicestercollection.com/bicester-village/'}
];
const tourism={ES:'https://www.spain.info/es/',Madrid:'https://www.esmadrid.com/',Barcelona:'https://www.barcelonaturisme.com/en/home',París:'https://parisjetaime.com/eng/'};
const api={checkedAt,refunds,tourist,stores,tourism,refund:code=>({...refunds[code]||{verified:false,source:general,note:'Las condiciones locales requieren verificación; podés registrar documentos, plazos confirmados por el operador y el estado del trámite.'},checkedAt})};
root.TaxEuropeRules=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

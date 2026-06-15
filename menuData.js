// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  MENU DATA — edit to change the menu content
//  Allergen codes (EU 14): GL CR EG FI PN SY MK NU CY MD SE SU LP ML
//  name / desc are per-language: { EN, ES, FR, DE }  (EN is the fallback)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// code → icon file under images/allergens/
const ALLERGEN_ICONS = {
  GL:'gluten.png', CR:'crustaceans.png', EG:'eggs.png', FI:'fish.png',
  PN:'peanuts.png', SY:'soy.png', MK:'milk.png', NU:'nuts.png',
  CY:'celery.png', MD:'mustard.png', SE:'sesame.png', SU:'sulphites.png',
  LP:'lupin.png', ML:'molluscs.png',
};

const CATEGORIES = ['Brunch','Small Plates','Mains','Sides','Sweets','Drinks'];

// Filters shown in the filter bar.
//   dietary  → tag ids ('v' vegetarian, 'vg' vegan)
//   freeFrom → allergen codes the diner wants to avoid
const FILTERS = { dietary:['v','vg'], freeFrom:['GL','PN','EG','MK'] };

// Each dish:
//   image     path under images/dishes/  — empty image shows a placeholder
//   pairsWith  array of other dish ids (drinks allowed) — shown in the popup
const DISHES = [
  // ── Brunch ──────────────────────────────────────────────────────────
  { id:'eggs-benedict', cat:'Brunch',
    name:{ EN:'Garden Eggs Benedict', ES:'Huevos Benedict', FR:'Œufs Bénédicte', DE:'Eier Benedict' },
    desc:{ EN:'Poached free-range eggs, smoked ham hock & chive hollandaise on toasted sourdough.', ES:'Huevos de corral escalfados, codillo ahumado y holandesa al cebollino sobre masa madre tostada.', FR:'Œufs pochés fermiers, jarret de porc fumé et hollandaise à la ciboulette sur pain au levain grillé.', DE:'Pochierte Freilandeier, geräucherte Schweinshaxe & Schnittlauch-Hollandaise auf getoastetem Sauerteigbrot.' },
    price:'13.50', allergens:['EG','GL','MK'], tags:[], image:'images/dishes/eggs-benedict.jpg', pairsWith:['flat-white','lemonade'] },
  { id:'avo-toast', cat:'Brunch',
    name:{ EN:'Avocado & Whipped Feta', ES:'Aguacate y Feta Batido', FR:'Avocat & Feta Fouettée', DE:'Avocado & Aufgeschlagener Feta' },
    desc:{ EN:'Smashed avocado, lemon-whipped feta, chilli & toasted seeds on rye.', ES:'Aguacate machacado, feta batido al limón, guindilla y semillas tostadas sobre pan de centeno.', FR:'Avocat écrasé, feta fouettée au citron, piment et graines torréfiées sur pain de seigle.', DE:'Zerdrückte Avocado, zitronig aufgeschlagener Feta, Chili & geröstete Saaten auf Roggenbrot.' },
    price:'11.00', allergens:['GL','MK','SE'], tags:['v'], image:'images/dishes/avocado-toast.jpg', pairsWith:['flat-white','lemonade'] },
  { id:'pancakes', cat:'Brunch',
    name:{ EN:'Buttermilk Pancakes', ES:'Tortitas de Suero', FR:'Pancakes au Babeurre', DE:'Buttermilch-Pancakes' },
    desc:{ EN:'Thick-cut stack with streaky bacon, maple syrup & whipped butter.', ES:'Torre de tortitas esponjosas con bacon, sirope de arce y mantequilla batida.', FR:'Pile de pancakes moelleux, bacon, sirop d\'érable et beurre fouetté.', DE:'Dicker Stapel mit Frühstücksspeck, Ahornsirup & aufgeschlagener Butter.' },
    price:'12.50', allergens:['GL','EG','MK'], tags:[], image:'images/dishes/buttermilk-pancakes.jpg', pairsWith:['flat-white'] },
  { id:'shakshuka', cat:'Brunch',
    name:{ EN:'Baked Eggs Shakshuka', ES:'Shakshuka de Huevos', FR:'Shakshuka aux Œufs', DE:'Shakshuka mit Eiern' },
    desc:{ EN:'Eggs baked in spiced tomato & pepper, crumbled feta & warm sourdough.', ES:'Huevos al horno en salsa especiada de tomate y pimiento, feta desmenuzado y masa madre templada.', FR:'Œufs cuits dans une sauce épicée tomate-poivron, feta émiettée et pain au levain tiède.', DE:'Eier in würziger Tomaten-Paprika-Sauce gebacken, zerbröselter Feta & warmes Sauerteigbrot.' },
    price:'12.50', allergens:['EG','MK','GL'], tags:['v'], image:'images/dishes/shakshuka.jpg', pairsWith:['flat-white','bread'] },
  { id:'full-irish', cat:'Brunch',
    name:{ EN:'The Full Irish', ES:'Desayuno Irlandés Completo', FR:'Le Petit-Déjeuner Irlandais', DE:'Das Irische Frühstück' },
    desc:{ EN:'Bacon, sausage, black & white pudding, fried eggs, beans & buttered toast.', ES:'Bacon, salchicha, morcilla blanca y negra, huevos fritos, alubias y tostada con mantequilla.', FR:'Bacon, saucisse, boudin noir et blanc, œufs au plat, haricots et toast beurré.', DE:'Speck, Wurst, schwarzer & weißer Pudding, Spiegeleier, Bohnen & gebuttertes Toast.' },
    price:'14.50', allergens:['GL','EG','MK','SU'], tags:[], image:'images/dishes/full-irish.jpg', pairsWith:['flat-white'] },

  // ── Small Plates ─────────────────────────────────────────────────────
  { id:'wings', cat:'Small Plates',
    name:{ EN:'Buttermilk Hot Wings', ES:'Alitas Picantes', FR:'Ailes de Poulet Croustillantes', DE:'Knusprige Hot Wings' },
    desc:{ EN:'Crispy wings tossed in house hot honey, blue cheese dip.', ES:'Alitas crujientes con miel picante de la casa y salsa de queso azul.', FR:'Ailes croustillantes au miel pimenté maison, sauce au bleu.', DE:'Knusprige Chicken Wings in scharfem Honig, Blauschimmelkäse-Dip.' },
    price:'9.50', allergens:['GL','MK'], tags:[], image:'images/dishes/buttermilk-wings.jpg', pairsWith:['ipa','fries'] },
  { id:'soup', cat:'Small Plates',
    name:{ EN:'Soup of the Day', ES:'Sopa del Día', FR:'Soupe du Jour', DE:'Tagessuppe' },
    desc:{ EN:'Seasonal vegetables, served with warm soda bread & butter.', ES:'Verduras de temporada, servida con pan de soda templado y mantequilla.', FR:'Légumes de saison, servie avec pain au bicarbonate tiède et beurre.', DE:'Saisonales Gemüse, serviert mit warmem Soda-Bread & Butter.' },
    price:'7.00', allergens:['GL','CY','MK'], tags:['v'], image:'images/dishes/soup-of-the-day.jpg', pairsWith:['bread'] },
  { id:'calamari', cat:'Small Plates',
    name:{ EN:'Crispy Calamari', ES:'Calamares Crujientes', FR:'Calamars Croustillants', DE:'Knusprige Calamari' },
    desc:{ EN:'Lightly floured rings, lemon aioli & pickled jalapeño.', ES:'Aros ligeramente enharinados, alioli de limón y jalapeño encurtido.', FR:'Anneaux légèrement farinés, aïoli au citron et jalapeño mariné.', DE:'Leicht bemehlte Ringe, Zitronen-Aioli & eingelegte Jalapeño.' },
    price:'10.00', allergens:['GL','EG','ML'], tags:[], image:'images/dishes/crispy-calamari.jpg', pairsWith:['ipa','lemonade'] },
  { id:'croquettes', cat:'Small Plates',
    name:{ EN:'Ham & Cheese Croquettes', ES:'Croquetas de Jamón y Queso', FR:'Croquettes Jambon-Fromage', DE:'Schinken-Käse-Kroketten' },
    desc:{ EN:'Crisp béchamel croquettes, smoked paprika aioli.', ES:'Croquetas crujientes de bechamel con alioli de pimentón ahumado.', FR:'Croquettes de béchamel croustillantes, aïoli au paprika fumé.', DE:'Knusprige Béchamel-Kroketten, Aioli mit geräuchertem Paprika.' },
    price:'8.50', allergens:['GL','MK','EG'], tags:[], image:'images/dishes/ham-croquettes.jpg', pairsWith:['red-wine','ipa'] },
  { id:'garlic-prawns', cat:'Small Plates',
    name:{ EN:'Chilli Garlic Prawns', ES:'Gambas al Ajillo', FR:'Gambas à l\'Ail et au Piment', DE:'Knoblauch-Garnelen' },
    desc:{ EN:'Sizzling prawns in chilli, garlic & olive oil with grilled sourdough.', ES:'Gambas al chisporroteo con guindilla, ajo y aceite de oliva, con masa madre a la parrilla.', FR:'Gambas grésillantes au piment, ail et huile d\'olive, pain au levain grillé.', DE:'Brutzelnde Garnelen in Chili, Knoblauch & Olivenöl mit gegrilltem Sauerteigbrot.' },
    price:'11.50', allergens:['CR','GL'], tags:[], popular:true, image:'images/dishes/garlic-prawns.jpg', pairsWith:['bread','red-wine'] },
  { id:'padron', cat:'Small Plates',
    name:{ EN:'Blistered Padrón Peppers', ES:'Pimientos de Padrón', FR:'Piments de Padrón', DE:'Geröstete Padrón-Paprika' },
    desc:{ EN:'Charred Padrón peppers, flaked sea salt. One in ten brings the heat.', ES:'Pimientos de Padrón asados con sal en escamas. Uno de cada diez pica.', FR:'Piments de Padrón grillés, fleur de sel. Un sur dix relève le défi.', DE:'Gegrillte Padrón-Paprika, Meersalzflocken. Jede zehnte ist scharf.' },
    price:'7.50', allergens:[], tags:['v','vg'], image:'images/dishes/padron-peppers.jpg', pairsWith:['ipa','red-wine'] },

  // ── Mains ────────────────────────────────────────────────────────────
  { id:'house-burger', cat:'Mains',
    name:{ EN:'The House Burger', ES:'Hamburguesa de la Casa', FR:'Le Burger Maison', DE:'Der House-Burger' },
    desc:{ EN:'Aged beef, smoked cheddar, pickles & burger sauce in a toasted brioche bun.', ES:'Ternera madurada, cheddar ahumado, pepinillos y salsa de la casa en pan brioche tostado.', FR:'Bœuf maturé, cheddar fumé, cornichons et sauce maison dans un pain brioché grillé.', DE:'Gereiftes Rindfleisch, geräucherter Cheddar, Gurken & Burgersauce im getoasteten Brioche-Bun.' },
    price:'16.50', allergens:['GL','EG','MK','MD'], tags:[], popular:true, image:'images/dishes/house-burger.jpg', pairsWith:['fries','ipa'] },
  { id:'chicken-burger', cat:'Mains',
    name:{ EN:'Buttermilk Chicken Burger', ES:'Hamburguesa de Pollo Crujiente', FR:'Burger de Poulet Croustillant', DE:'Buttermilch-Chicken-Burger' },
    desc:{ EN:'Crispy chicken thigh, slaw & sriracha mayo, skin-on fries.', ES:'Muslo de pollo crujiente, ensalada de col y mayonesa sriracha, patatas con piel.', FR:'Cuisse de poulet croustillante, salade de chou et mayo sriracha, frites avec peau.', DE:'Knuspriger Hähnchenschenkel, Krautsalat & Sriracha-Mayo, Pommes mit Schale.' },
    price:'15.00', allergens:['GL','EG','MK'], tags:[], image:'images/dishes/chicken-burger.jpg', pairsWith:['slaw','lemonade'] },
  { id:'sea-bass', cat:'Mains',
    name:{ EN:'Pan-Seared Sea Bass', ES:'Lubina a la Plancha', FR:'Bar Poêlé', DE:'Gebratener Wolfsbarsch' },
    desc:{ EN:'Lemon-caper butter, crushed new potatoes & seasonal greens.', ES:'Mantequilla de limón y alcaparras, patatas nuevas chafadas y verduras de temporada.', FR:'Beurre citron-câpres, pommes de terre nouvelles écrasées et légumes de saison.', DE:'Zitronen-Kapern-Butter, zerdrückte neue Kartoffeln & saisonales Grüngemüse.' },
    price:'19.50', allergens:['FI','MK'], tags:[], image:'images/dishes/sea-bass.jpg', pairsWith:['bread','lemonade'] },
  { id:'risotto', cat:'Mains',
    name:{ EN:'Wild Mushroom Risotto', ES:'Risotto de Setas', FR:'Risotto aux Champignons', DE:'Wildpilz-Risotto' },
    desc:{ EN:'Arborio rice, aged parmesan, truffle oil & rocket.', ES:'Arroz arborio, parmesano curado, aceite de trufa y rúcula.', FR:'Riz arborio, parmesan affiné, huile de truffe et roquette.', DE:'Arborio-Reis, gereifter Parmesan, Trüffelöl & Rucola.' },
    price:'15.50', allergens:['MK','CY','SU'], tags:['v'], image:'images/dishes/mushroom-risotto.jpg', pairsWith:['bread','red-wine'] },
  { id:'steak-frites', cat:'Mains',
    name:{ EN:'Ribeye Steak Frites', ES:'Entrecot con Patatas', FR:'Entrecôte Frites', DE:'Ribeye-Steak mit Pommes' },
    desc:{ EN:'10oz dry-aged ribeye, green peppercorn sauce & skin-on fries.', ES:'Entrecot madurado en seco de 280 g, salsa de pimienta verde y patatas con piel.', FR:'Entrecôte maturée à sec de 280 g, sauce au poivre vert et frites avec peau.', DE:'280 g dry-aged Ribeye, grüne Pfeffersauce & Pommes mit Schale.' },
    price:'26.00', allergens:['MK','SU'], tags:[], popular:true, image:'images/dishes/steak-frites.jpg', pairsWith:['red-wine','fries'] },
  { id:'fish-chips', cat:'Mains',
    name:{ EN:'Beer-Battered Fish & Chips', ES:'Fish & Chips Rebozado en Cerveza', FR:'Fish & Chips à la Bière', DE:'Fish & Chips im Bierteig' },
    desc:{ EN:'Fresh haddock in crisp batter, triple-cooked chips, mushy peas & tartare.', ES:'Eglefino fresco en rebozado crujiente, patatas tres cocciones, puré de guisantes y salsa tártara.', FR:'Églefin frais en pâte croustillante, frites triple cuisson, purée de petits pois et sauce tartare.', DE:'Frischer Schellfisch im knusprigen Bierteig, dreifach gegarte Pommes, Erbsenpüree & Sauce Tartare.' },
    price:'17.50', allergens:['FI','GL','EG','SU'], tags:[], image:'images/dishes/fish-and-chips.jpg', pairsWith:['ipa','slaw'] },
  { id:'margherita', cat:'Mains',
    name:{ EN:'Stone-Baked Margherita', ES:'Margarita al Horno de Piedra', FR:'Margherita au Four à Pierre', DE:'Steinofen-Margherita' },
    desc:{ EN:'San Marzano tomato, fior di latte & fresh basil on a slow-proved base.', ES:'Tomate San Marzano, fior di latte y albahaca fresca sobre masa de fermentación lenta.', FR:'Tomate San Marzano, fior di latte et basilic frais sur une pâte à maturation lente.', DE:'San-Marzano-Tomate, Fior di Latte & frisches Basilikum auf langgereiftem Teig.' },
    price:'13.50', allergens:['GL','MK'], tags:['v'], image:'images/dishes/margherita-pizza.jpg', pairsWith:['red-wine','ipa'] },

  // ── Sides ────────────────────────────────────────────────────────────
  { id:'fries', cat:'Sides',
    name:{ EN:'Skin-On Fries', ES:'Patatas con Piel', FR:'Frites avec Peau', DE:'Pommes mit Schale' },
    desc:{ EN:'Rosemary salt, roasted garlic aioli.', ES:'Sal de romero y alioli de ajo asado.', FR:'Sel au romarin, aïoli à l\'ail rôti.', DE:'Rosmarinsalz, Aioli mit geröstetem Knoblauch.' },
    price:'4.50', allergens:['EG'], tags:['v','vg'], image:'images/dishes/skin-on-fries.jpg', pairsWith:['house-burger'] },
  { id:'slaw', cat:'Sides',
    name:{ EN:'House Slaw', ES:'Ensalada de Col de la Casa', FR:'Salade de Chou Maison', DE:'Hausgemachter Krautsalat' },
    desc:{ EN:'Crunchy cabbage & carrot, bright lemon dressing.', ES:'Col y zanahoria crujientes con aliño de limón.', FR:'Chou et carotte croquants, vinaigrette au citron.', DE:'Knackiger Kohl & Karotte, frisches Zitronendressing.' },
    price:'4.00', allergens:['EG','MD'], tags:['v'], image:'images/dishes/house-slaw.jpg', pairsWith:['chicken-burger'] },
  { id:'bread', cat:'Sides',
    name:{ EN:'Warm Soda Bread', ES:'Pan de Soda Templado', FR:'Pain au Bicarbonate Tiède', DE:'Warmes Soda-Bread' },
    desc:{ EN:'House-baked daily, cultured butter.', ES:'Horneado a diario en casa, con mantequilla de cultivo.', FR:'Cuit maison chaque jour, beurre de baratte.', DE:'Täglich hausgebacken, Sauerrahmbutter.' },
    price:'3.50', allergens:['GL','MK'], tags:['v'], image:'images/dishes/soda-bread.jpg', pairsWith:['soup'] },
  { id:'mac-cheese', cat:'Sides',
    name:{ EN:'Three-Cheese Mac', ES:'Macarrones con Tres Quesos', FR:'Mac & Cheese aux Trois Fromages', DE:'Mac & Cheese mit Drei Käsesorten' },
    desc:{ EN:'Cheddar, gruyère & parmesan with a toasted herb crumb.', ES:'Cheddar, gruyère y parmesano con costra de hierbas tostada.', FR:'Cheddar, gruyère et parmesan, chapelure d\'herbes gratinée.', DE:'Cheddar, Gruyère & Parmesan mit gerösteten Kräuterbröseln.' },
    price:'6.00', allergens:['GL','MK'], tags:['v'], image:'images/dishes/mac-and-cheese.jpg', pairsWith:['house-burger'] },

  // ── Sweets ───────────────────────────────────────────────────────────
  { id:'stp', cat:'Sweets',
    name:{ EN:'Sticky Toffee Pudding', ES:'Pudin de Toffee', FR:'Pudding Sticky Toffee', DE:'Sticky Toffee Pudding' },
    desc:{ EN:'Warm date sponge, toffee sauce & vanilla bean ice cream.', ES:'Bizcocho templado de dátiles, salsa de toffee y helado de vainilla.', FR:'Génoise tiède aux dattes, sauce caramel et glace à la vanille.', DE:'Warmer Dattelkuchen, Toffeesauce & Vanilleeis.' },
    price:'7.50', allergens:['GL','EG','MK'], tags:['v'], image:'images/dishes/sticky-toffee-pudding.jpg', pairsWith:['flat-white'] },
  { id:'brownie', cat:'Sweets',
    name:{ EN:'Dark Chocolate Brownie', ES:'Brownie de Chocolate Negro', FR:'Brownie au Chocolat Noir', DE:'Zartbitter-Brownie' },
    desc:{ EN:'Salted caramel, honeycomb crumb & cream.', ES:'Caramelo salado, crocanti de miel y nata.', FR:'Caramel au beurre salé, éclats de nougatine et crème.', DE:'Gesalzenes Karamell, Honigwaben-Crunch & Sahne.' },
    price:'7.00', allergens:['GL','EG','MK','SY'], tags:['v'], image:'images/dishes/chocolate-brownie.jpg', pairsWith:['flat-white'] },
  { id:'cheesecake', cat:'Sweets',
    name:{ EN:'Baked Vanilla Cheesecake', ES:'Tarta de Queso al Horno', FR:'Cheesecake Vanille Cuit', DE:'Gebackener Vanille-Cheesecake' },
    desc:{ EN:'Digestive base, fresh berry compote.', ES:'Base de galleta, compota de frutos rojos.', FR:'Base biscuitée, compote de fruits rouges.', DE:'Keksboden, frisches Beerenkompott.' },
    price:'7.00', allergens:['GL','EG','MK'], tags:['v'], image:'images/dishes/vanilla-cheesecake.jpg', pairsWith:['flat-white'] },
  { id:'apple-crumble', cat:'Sweets',
    name:{ EN:'Spiced Apple Crumble', ES:'Crumble de Manzana Especiado', FR:'Crumble aux Pommes Épicé', DE:'Gewürz-Apfelcrumble' },
    desc:{ EN:'Bramley apple, oat crumble & warm vanilla custard.', ES:'Manzana Bramley, crumble de avena y crema inglesa de vainilla templada.', FR:'Pommes Bramley, crumble à l\'avoine et crème anglaise à la vanille.', DE:'Bramley-Apfel, Haferflocken-Streusel & warme Vanillesauce.' },
    price:'7.50', allergens:['GL','MK','EG'], tags:['v'], image:'images/dishes/apple-crumble.jpg', pairsWith:['flat-white'] },

  // ── Drinks ───────────────────────────────────────────────────────────
  { id:'flat-white', cat:'Drinks',
    name:{ EN:'Flat White', ES:'Flat White', FR:'Flat White', DE:'Flat White' },
    desc:{ EN:'Double ristretto shot, silky steamed milk.', ES:'Doble ristretto con leche vaporizada y sedosa.', FR:'Double ristretto, lait vapeur soyeux.', DE:'Doppelter Ristretto, seidig aufgeschäumte Milch.' },
    price:'3.60', allergens:['MK'], tags:['v'], image:'images/dishes/flat-white.jpg', pairsWith:['stp','brownie'] },
  { id:'lemonade', cat:'Drinks',
    name:{ EN:'Fresh Mint Lemonade', ES:'Limonada de Menta Fresca', FR:'Limonade à la Menthe Fraîche', DE:'Frische Minz-Limonade' },
    desc:{ EN:'Pressed lemon, muddled mint & soda over ice.', ES:'Limón exprimido, menta y soda con hielo.', FR:'Citron pressé, menthe pilée et eau gazeuse sur glace.', DE:'Gepresste Zitrone, Minze & Soda auf Eis.' },
    price:'4.20', allergens:[], tags:['v','vg'], image:'images/dishes/mint-lemonade.jpg', pairsWith:['calamari'] },
  { id:'ipa', cat:'Drinks',
    name:{ EN:'Craft IPA — Local', ES:'IPA Artesanal — Local', FR:'IPA Artisanale — Locale', DE:'Craft IPA — Lokal' },
    desc:{ EN:'Rotating selection from Irish microbreweries. Ask your server.', ES:'Selección rotativa de microcervecerías irlandesas. Pregunte a su camarero.', FR:'Sélection tournante de microbrasseries irlandaises. Demandez à votre serveur.', DE:'Wechselnde Auswahl irischer Mikrobrauereien. Fragen Sie Ihren Kellner.' },
    price:'6.50', allergens:['GL','SU'], tags:['vg'], image:'images/dishes/craft-ipa.jpg', pairsWith:['wings','house-burger'] },
  { id:'red-wine', cat:'Drinks',
    name:{ EN:'House Malbec', ES:'Malbec de la Casa', FR:'Malbec Maison', DE:'House Malbec' },
    desc:{ EN:'Mendoza Malbec, by the glass — ripe plum & soft spice.', ES:'Malbec de Mendoza, por copa — ciruela madura y especias suaves.', FR:'Malbec de Mendoza, au verre — prune mûre et épices douces.', DE:'Mendoza Malbec, glasweise — reife Pflaume & sanfte Würze.' },
    price:'7.00', allergens:['SU'], tags:['v','vg'], image:'images/dishes/red-wine.jpg', pairsWith:['steak-frites','margherita'] },
];

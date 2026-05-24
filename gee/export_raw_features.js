// ==============================================================================
// GEE EXPORT SCRIPT: RAW FEATURES BUKIT JAAS (POLYGON ONLY)
// Output: RAW_Features_BukitJaas_2024.csv (Piksel berukuran 10m + 17 fitur)
// ==============================================================================

// ── 1. GEOMETRI & AREA OF INTEREST (AOI) ──────────────────────────────────────
var center = ee.Geometry.Point([111.698701, -8.051952]);

var common_area = center.buffer(750).bounds();

var forest_polygon = ee.Geometry.Polygon([
  [
    [111.69193853602059, -8.050162051665376], [111.69238914713509, -8.050268282775814],
    [111.69283975824959, -8.050395760071572], [111.69345130190499, -8.050470121808905],
    [111.69382681116707, -8.050385136965133], [111.69540395006783, -8.050990653588038],
    [111.69551123842842, -8.051319969266109], [111.69550050959236, -8.051649284676426],
    [111.69547905192024, -8.051936107557585], [111.69599403605110, -8.053646417557847],
    [111.69515586173776, -8.054564373610994], [111.69495201385263, -8.054564373610994],
    [111.69480181014780, -8.055053031176435], [111.69472670829538, -8.055637294882679],
    [111.69469452178720, -8.056104705240543], [111.69508075988534, -8.056210934792064],
    [111.69544554031137, -8.056295918413205], [111.69596052444223, -8.056264049557361],
    [111.69664716995004, -8.056221557745683], [111.69672227180246, -8.056221557745683],
    [111.69671154296640, -8.055987852701676], [111.69774151122812, -8.054968047294386],
    [111.69846034324411, -8.054936178334016], [111.69931865012887, -8.055276113781970],
    [111.69980144775155, -8.055180506966085], [111.70050955093149, -8.054585619604362],
    [111.70076704299692, -8.054553750613890], [111.70100307739023, -8.054511258622690],
    [111.70183992660287, -8.054670603566700], [111.70236563956979, -8.054362536618381],
    [111.70282697952035, -8.054011977392053], [111.70327759063485, -8.053172758617334],
    [111.70353598135235, -8.053159787198918], [111.70379347341778, -8.053053556846850],
    [111.70409388082744, -8.052671127348681], [111.70454449194195, -8.052118728547116],
    [111.70501656072857, -8.051630067440765], [111.70506047853780, -8.051185049473680],
    [111.70495855459524, -8.051052260881786], [111.70485126623464, -8.050898226060669],
    [111.70471983799291, -8.050707010339162], [111.70461523184133, -8.050539696508807],
    [111.70457231649709, -8.050470646336455], [111.70448380359960, -8.050460023231961],
    [111.70393395075155, -8.050515794527401], [111.70356380590749, -8.050521106078948],
    [111.70308637270284, -8.050505171424106], [111.70263039717031, -8.050446744350980],
    [111.70234608301473, -8.050239593751060], [111.70193838724447, -8.050218347529698],
    [111.70178281912160, -8.050202412862950], [111.70159506449056, -8.050074935506341],
    [111.70142340311361, -8.049883719396231], [111.70132684358907, -8.049676568508412],
    [111.70127856382680, -8.049485352210269], [111.70132147917104, -8.049352563061245],
    [111.70154678472830, -8.049304758956940], [111.70172917494130, -8.049140100332268],
    [111.70202958235097, -8.048858587044770], [111.70227634558034, -8.048624877751823],
    [111.70248555788350, -8.048423037799449], [111.70266794809652, -8.048242444072610],
    [111.70267867693258, -8.048157458761551], [111.70264321919039, -8.047877730328201],
    [111.70262176151827, -8.047580281393780], [111.70261103268221, -8.047452803212188],
    [111.70158106442050, -8.046996006065534], [111.70144803188943, -8.046503094483654],
    [111.70140511654519, -8.046237514187542], [111.70136220120095, -8.046025049825339],
    [111.70134074352883, -8.045908194378656], [111.70117981098794, -8.045748845987982],
    [111.70117981098794, -8.045472641962410], [111.70117981098794, -8.045175191262873],
    [111.69193155430459, -8.045185814505897], [111.69193853602059, -8.050162051665376]
  ]
]);

// Map settings
Map.setOptions('SATELLITE');
Map.centerObject(common_area, 15);

// ── 2. SENTINEL-2 SR & INDICES ────────────────────────────────────────────────
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(forest_polygon)
  .filterDate('2024-01-01', '2025-01-01')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
  .median()
  .clip(forest_polygon);

var NDVI = s2.normalizedDifference(['B8', 'B4']).rename('NDVI');

var EVI = s2.expression(
  '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))', {
    'NIR' : s2.select('B8'),
    'RED' : s2.select('B4'),
    'BLUE': s2.select('B2')
  }).rename('EVI');

var SAVI = s2.expression(
  '1.5 * ((NIR - RED) / (NIR + RED + 0.5))', {
    'NIR': s2.select('B8'),
    'RED': s2.select('B4')
  }).rename('SAVI');

var NBR = s2.normalizedDifference(['B8', 'B12']).rename('NBR');

// ── 4. ETH CANOPY HEIGHT 2020 ─────────────────────────────────────────────────
var eth = ee.Image('users/nlang/ETH_GlobalCanopyHeight_2020_10m_v1')
  .select('b1')
  .rename('ETH_CanopyHeight')
  .clip(forest_polygon);

// ── 5. TERRAIN (SRTM) ─────────────────────────────────────────────────────────
var srtm      = ee.Image('USGS/SRTMGL1_003').clip(forest_polygon);
var elevation = srtm.select('elevation').rename('Elevation');
var terrain   = ee.Terrain.products(srtm);
var slope     = terrain.select('slope').rename('Slope');
var aspect    = terrain.select('aspect').rename('Aspect');

// ── 6. PENGGABUNGAN SEMUA FITUR (RESAMPLING 10m) ──────────────────────────────
var features = s2.select(['B2', 'B3', 'B4', 'B8', 'B11', 'B12'])
  .addBands(NDVI)
  .addBands(EVI)
  .addBands(SAVI)
  .addBands(NBR)
  .addBands(eth.resample('bilinear').reproject({crs: s2.projection(), scale: 10}))
  .addBands(elevation.resample('bilinear').reproject({crs: s2.projection(), scale: 10}))
  .addBands(slope.resample('bilinear').reproject({crs: s2.projection(), scale: 10}))
  .addBands(aspect.resample('bilinear').reproject({crs: s2.projection(), scale: 10}));

// ── 7. VISUALISASI LAYER ──────────────────────────────────────────────────────

// AOI boundaries — tampilkan paling akhir agar di atas semua layer
Map.addLayer(
  s2.select(['B4', 'B3', 'B2']),
  {min: 0, max: 3000, gamma: 1.4},
  '🛰 True Color (B4-B3-B2)'
);

Map.addLayer(
  s2.select(['B8', 'B4', 'B3']),
  {min: 0, max: 3000, gamma: 1.4},
  '🌿 False Color NIR (B8-B4-B3)',
  false  // default off, bisa di-toggle
);

Map.addLayer(
  NDVI,
  {min: -0.2, max: 0.8, palette: ['#d73027','#fee08b','#1a9850','#006837']},
  '📊 NDVI'
);

Map.addLayer(
  EVI,
  {min: -0.2, max: 0.8, palette: ['#d73027','#fee08b','#1a9850','#006837']},
  '📊 EVI',
  false
);

Map.addLayer(
  eth,
  {min: 0, max: 40, palette: ['#ffffff','#a8ddb5','#43a2ca','#006837']},
  '🌳 ETH Canopy Height (m)'
);

Map.addLayer(
  elevation,
  {min: 50, max: 400, palette: ['#ffffcc','#a1dab4','#41b6c4','#225ea8']},
  '⛰ Elevation (mdpl)',
  false
);

Map.addLayer(
  slope,
  {min: 0, max: 45, palette: ['#f7fbff','#6baed6','#08306b']},
  '📐 Slope (derajat)',
  false
);

// Boundaries di atas semua layer
Map.addLayer(
  common_area,
  {color: 'red', fillColor: '00000000'},
  '🟥 Kotak Referensi 1.5×1.5 km'
);

Map.addLayer(
  ee.FeatureCollection(forest_polygon).style({
    color     : '00FFFF',
    width     : 2,
    fillColor : '00FFFF00'
  }),
  {},
  '🟦 Poligon Hutan Bukit Jaas'
);

// ── 8. CEK KETERSEDIAAN DATA (Console) ────────────────────────────────────────
print('-----------------------------------------');
print('   CEK KETERSEDIAAN DATA — BUKIT JAAS');
print('-----------------------------------------');

// Sentinel-2
var s2_col = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(forest_polygon)
  .filterDate('2024-01-01', '2025-01-01')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30));

print('📡 Sentinel-2: jumlah citra lolos filter', s2_col.size());
print('   Tanggal:', s2_col.aggregate_array('system:time_start')
  .map(function(t){ return ee.Date(t).format('YYYY-MM-dd'); }));
print('   Cloud % :', s2_col.aggregate_array('CLOUDY_PIXEL_PERCENTAGE'));

// Landsat
var ls_col = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .merge(ee.ImageCollection('LANDSAT/LC09/C02/T1_L2'))
  .filterBounds(forest_polygon)
  .filterDate('2024-01-01', '2025-01-01')
  .filter(ee.Filter.lt('CLOUD_COVER', 30));

print('🛸 Landsat 8/9: jumlah citra lolos filter', ls_col.size());
print('   Tanggal:', ls_col.aggregate_array('system:time_start')
  .map(function(t){ return ee.Date(t).format('YYYY-MM-dd'); }));

// ETH Canopy Height stats
print('🌳 ETH Canopy Height 2020 — statistik di area:',
  eth.reduceRegion({
    reducer  : ee.Reducer.min().combine(ee.Reducer.max(),'',true)
                              .combine(ee.Reducer.mean(),'',true),
    geometry : forest_polygon,
    scale    : 10,
    maxPixels: 1e9
  })
);

// SRTM Elevation stats
print('⛰ SRTM Elevation — statistik di area:',
  elevation.reduceRegion({
    reducer  : ee.Reducer.min().combine(ee.Reducer.max(),'',true)
                              .combine(ee.Reducer.mean(),'',true),
    geometry : forest_polygon,
    scale    : 30,
    maxPixels: 1e9
  })
);

// NDVI stats
print('📊 NDVI — statistik di area:',
  NDVI.reduceRegion({
    reducer  : ee.Reducer.min().combine(ee.Reducer.max(),'',true)
                              .combine(ee.Reducer.mean(),'',true),
    geometry : forest_polygon,
    scale    : 10,
    maxPixels: 1e9
  })
);

// Sentinel-2 per bulan — berapa citra lolos per bulan?
print('📅 Sentinel-2: jumlah citra per bulan 2024');
var monthly = ee.List.sequence(1, 12).map(function(m) {
  var n = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterBounds(forest_polygon)
    .filter(ee.Filter.calendarRange(2024, 2024, 'year'))
    .filter(ee.Filter.calendarRange(m, m, 'month'))
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
    .size();
  return ee.Feature(null, {'bulan': m, 'jumlah_citra': n});
});
print(ee.FeatureCollection(monthly));

// Band names & total piksel
print('-----------------------------------------');
print('Bands siap ekspor:', features.bandNames());

// ── 9. SAMPLING PIKSEL ────────────────────────────────────────────────────────
var samples = features.sample({
  region    : forest_polygon,
  scale     : 10,
  projection: 'EPSG:4326',
  geometries: true,
  dropNulls : false
});

samples = samples.map(function(f) {
  var coords = f.geometry().coordinates();
  return f
    .set('longitude', coords.get(0))
    .set('latitude',  coords.get(1));
});

print('Total piksel dalam poligon:', samples.size());
print('-----------------------------------------');

// ── 10. EKSPOR KE GOOGLE DRIVE ────────────────────────────────────────────────
Export.table.toDrive({
  collection    : samples,
  description   : 'raw_bukit_jaas_750_2024',
  fileNamePrefix: 'raw_bukit_jaas_750_2024',
  fileFormat    : 'CSV',
  selectors     : [
    'longitude', 'latitude',
    'B2', 'B3', 'B4', 'B8', 'B11', 'B12',
    'NDVI', 'EVI', 'SAVI', 'NBR',
    'ETH_CanopyHeight', 'Elevation', 'Slope', 'Aspect'
  ]
});

// ── TRAINING DATA: SAMPLING MANUAL (LABEL STRING) ─────────────────────────────
// Label menggunakan string sesuai standar NFRL MoEF 2022
// Konsisten dengan LULC_LABELS di config.py

var pts_1 = sample_hutan_primer.map(function(f) {
  return f.set('Class', 'Primary_Forest');
});
var pts_2 = sample_hutan_sekunder.map(function(f) {  // ← typo diperbaiki
  return f.set('Class', 'Secondary_Forest');
});
var pts_3 = sample_crop_estate.map(function(f) {
  return f.set('Class', 'Estate_Crop');
});
var pts_4 = sample_sawah.map(function(f) {
  return f.set('Class', 'Paddy_Field');
});
var pts_5 = sample_pemukiman.map(function(f) {
  return f.set('Class', 'Settlement');
});
var pts_6 = sample_bare_ground.map(function(f) {
  return f.set('Class', 'Bare_Ground');  // ← 'class' → 'Class', konsisten
});

// Gabung semua training points
var all_training_pts = pts_1
  .merge(pts_2)
  .merge(pts_3)
  .merge(pts_4)
  .merge(pts_5)
  .merge(pts_6);

// Verifikasi distribusi kelas sebelum export
print('=== DISTRIBUSI TRAINING SAMPLES ===');
print('Total titik:', all_training_pts.size());
print('Per kelas:', all_training_pts.aggregate_histogram('Class'));

// Ekstraksi nilai fitur di setiap titik training
var training_data = features.sampleRegions({
  collection: all_training_pts,
  properties: ['Class'],
  scale     : 10,
  tileScale : 16,
  geometries: true
});

// Tambahkan longitude & latitude eksplisit
// (.geo dari GEE formatnya nested JSON, lebih aman ekstrak manual)
training_data = training_data.map(function(f) {
  var coords = f.geometry().coordinates();
  return f
    .set('longitude', coords.get(0))
    .set('latitude',  coords.get(1));
});

print('Total training samples dengan fitur:', training_data.size());

// Export training data
Export.table.toDrive({
  collection    : training_data,
  description   : 'training_data_manual_sampling',
  fileNamePrefix: 'training_data_manual_sampling',
  fileFormat    : 'CSV',
  selectors     : [
    'longitude', 'latitude',
    'B2', 'B3', 'B4', 'B8', 'B11', 'B12',
    'NDVI', 'EVI', 'SAVI', 'NBR', 'LS_NDVI',
    'ETH_CanopyHeight', 'Elevation', 'Slope', 'Aspect',
    'Class'   
  ]
});

print('→ Klik Tasks → Run untuk export.');
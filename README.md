# LULC & Carbon Stock Prediction — Bukit Jaas

Prediksi tutupan lahan (LULC) dan estimasi cadangan karbon di kawasan Bukit Jaas menggunakan Random Forest berbasis citra Sentinel-2 dan data topografi.

---

## Pipeline

```
data/raw/  (11.373 pixel, tanpa label)
data/labeled/  (207 pixel, berlabel manual)
        │
        ▼
[01_eda.ipynb]  ──────────────────────────────  Eksplorasi & validasi data
        │
        ▼
[02_preprocessing.ipynb]  ────────────────────  Feature selection + train/test split
        │
        ▼
[experiments/01_random_forest.ipynb]  ────────  Training, tuning, evaluasi model
        │
        ▼  model.pkl + config.json
        │
        ▼
[03_inference.ipynb]  ────────────────────────  Prediksi 11.373 pixel + estimasi karbon
        │
        ▼
data/output/predictions_lulc.csv
data/output/carbon_stock_map.csv
```

---

## Struktur Direktori

```
├── data/
│   ├── labeled/    → labeled_data_manual_sampling.csv   (207 pixel, berlabel)
│   ├── raw/        → raw_bukit_jaas_750_2024.csv        (11.373 pixel, unlabeled)
│   └── output/     → hasil prediksi & estimasi karbon
├── gee/            → script Google Earth Engine untuk ekspor data
├── models/
│   └── 01_random_forest/
│       └── {YYYYMMDD_HHMM}/
│           ├── model.pkl      (tidak di-track git)
│           └── config.json    (di-track git)
├── notebooks/
│   ├── 01_eda.ipynb
│   ├── 02_preprocessing.ipynb
│   ├── 03_inference.ipynb
│   └── experiments/
│       └── 01_random_forest.ipynb
└── src/
    └── carbon_lookup.py       → lookup table karbon (MoEF 2022)
```

---

## Kelas LULC

| Kelas | Carbon Stock (ton C/ha) |
|---|---|
| Primary_Forest | 210.92 |
| Secondary_Forest | 127.18 |
| Estate_Crop | 63.73 |
| Paddy_Field | 12.35 |
| Bare_Ground | 2.96 |
| Settlement | 2.79 |

> Sumber: MoEF 2022, Table 9

---

## Fitur Input (14 fitur)

| Grup | Fitur |
|---|---|
| Spektral Sentinel-2 | B2, B3, B4, B8, B11, B12 |
| Indeks Vegetasi | NDVI, EVI, SAVI, NBR |
| Kanopi | ETH_CanopyHeight |
| Topografi | Elevation, Slope, Aspect |

---

## Alur Eksperimen

### 1. EDA — `notebooks/01_eda.ipynb`

Jalankan pertama kali untuk memahami data sebelum modeling.

- Distribusi kelas (class imbalance check)
- Missing values & outlier detection (boxplot)
- Eksplorasi spasial dengan GeoPandas — plot titik sampling vs raw pixels
- Correlation matrix (lower triangle) — identifikasi fitur redundan
- Histogram distribusi per fitur per kelas

**Output yang perlu dicatat:** pasangan fitur dengan korelasi |r| ≥ 0.85 → digunakan sebagai `features_to_drop` di step berikutnya.

---

### 2. Preprocessing — `notebooks/02_preprocessing.ipynb`

- Update `features_to_drop` berdasarkan hasil EDA
- Stratified train/test split (80/20, `SEED=42`)
- Imbalance handling: `class_weight='balanced'` di model RF (tanpa SMOTE)

**Config yang perlu diperhatikan:**
```python
SEED             = 42
test_size        = 0.2
features_to_drop = []   # isi setelah lihat EDA
```

---

### 3. Training & Tuning — `notebooks/experiments/01_random_forest.ipynb`

- `RandomizedSearchCV` + `StratifiedKFold` (5-fold)
- Scoring metric: `f1_macro`
- Setiap run menghasilkan `run_id` unik format `YYYYMMDD_HHMM`

**Hyperparameter yang di-search:**
```python
param_grid = {
    "n_estimators"     : [100, 200, 300],
    "max_depth"        : [None, 10, 20, 30],
    "min_samples_split": [2, 5, 10],
    "max_features"     : ["sqrt", "log2"],
    "class_weight"     : ["balanced"],
}
```

**Evaluasi:**
- Overall Accuracy
- Cohen's Kappa Score
- Confusion Matrix
- Classification Report per kelas
- Feature Importance (MDI)

**Output:** `models/01_random_forest/{run_id}/model.pkl` + `config.json`

---

### 4. Inference & Carbon Estimation — `notebooks/03_inference.ipynb`

- Isi `run_id` dengan run terbaik dari step 3
- Prediksi kelas untuk 11.373 pixel raw
- Sanity check: bandingkan prediksi vs label asli pada 207 pixel labeled
- Estimasi karbon menggunakan `src/carbon_lookup.py`

**Konversi karbon:**
```
carbon_stock (ton C/ha)  ×  0.01 ha/pixel  =  carbon_total_ton
carbon_total_ton  ×  (44/12)               =  co2_equivalent_ton
co2_equivalent_ton  ×  USD 25              =  economic_value_usd
```

**Output:**
- `data/output/predictions_lulc.csv` — prediksi kelas + confidence per pixel
- `data/output/carbon_stock_map.csv` — estimasi karbon + nilai ekonomi per pixel

---

## Setup Environment

```bash
conda activate caps30
pip install -r requirements.txt
```

---

## Metrik Evaluasi Utama

| Metrik | Keterangan |
|---|---|
| Overall Accuracy | Proporsi prediksi benar dari seluruh pixel test |
| Cohen's Kappa | Akurasi terkoreksi chance agreement — konsisten dengan paper referensi |

> Kappa > 0.8: sangat baik / Kappa 0.6–0.8: baik / Kappa < 0.6: perlu peningkatan

---

## Catatan

- `Open_Water` tidak ada di training data — jika muncul di prediksi, flag sebagai anomali
- `model.pkl` tidak di-track git (file besar). Reproduksi dengan menjalankan ulang notebook experiment
- Semua konstanta karbon hanya ada di `src/carbon_lookup.py` — jangan diduplikasi

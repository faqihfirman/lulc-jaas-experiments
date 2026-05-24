# Source: MoEF 2022, Table 9

CARBON_STOCK_PER_HA = {
    "Primary_Forest"   : 210.92,
    "Secondary_Forest" : 127.18,
    "Estate_Crop"      :  63.73,
    "Paddy_Field"      :  12.35,
    "Settlement"       :   2.79,
    "Bare_Ground"      :   2.96,
    "Open_Water"       :   0.00,
}

PIXEL_AREA_HA        = 0.01
CO2_CONVERSION_RATIO = 44 / 12
CARBON_PRICE_USD     = 25.0


def get_carbon_stock_per_ha(lulc_class: str) -> float:
    return CARBON_STOCK_PER_HA.get(lulc_class, 0.0)


def calculate_carbon_total_ton(lulc_class: str, pixel_count: int = 1) -> float:
    return get_carbon_stock_per_ha(lulc_class) * PIXEL_AREA_HA * pixel_count


def calculate_co2_equivalent_ton(carbon_ton: float) -> float:
    return carbon_ton * CO2_CONVERSION_RATIO


def calculate_economic_value_usd(co2_ton: float) -> float:
    return co2_ton * CARBON_PRICE_USD

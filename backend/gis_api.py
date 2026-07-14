"""
AeroTwin GIS & Environmental Intelligence API
Integrates: OpenStreetMap (Nominatim), Open-Meteo, Open Elevation, ISRIC SoilGrids
All free, no API keys required!
"""
import httpx
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
import asyncio

router = APIRouter(prefix="/gis", tags=["GIS & Environment"])

# ── Schemas ───────────────────────────────────────────────────────────────────

class GeocodingResult(BaseModel):
    lat: float
    lon: float
    display_name: str
    address: dict

class WeatherData(BaseModel):
    lat: float
    lon: float
    temperature: float
    wind_speed: float
    wind_direction: float
    precipitation: float
    humidity: float
    visibility: float
    weather_code: int
    construction_risk: str
    risk_reason: str
    forecast_7days: list

class ElevationData(BaseModel):
    lat: float
    lon: float
    elevation_m: float
    slope_category: str
    flood_risk: str
    foundation_recommendation: str

class SoilData(BaseModel):
    lat: float
    lon: float
    soil_type: str
    sand_percent: float
    clay_percent: float
    silt_percent: float
    organic_carbon: float
    bulk_density: float
    bearing_capacity_kPa: float
    foundation_type: str
    excavation_difficulty: str

# ── Weather Code Descriptions ─────────────────────────────────────────────────

WEATHER_CODES = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Foggy", 48: "Icy fog", 51: "Light drizzle", 53: "Moderate drizzle",
    55: "Dense drizzle", 61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
    80: "Slight showers", 81: "Moderate showers", 82: "Violent showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Heavy thunderstorm"
}

def calculate_construction_risk(weather: dict) -> tuple[str, str]:
    """Calculate construction risk level from weather data."""
    wc = weather.get("weather_code", 0)
    wind = weather.get("wind_speed_10m", 0)
    precip = weather.get("precipitation", 0)
    temp = weather.get("temperature_2m", 25)

    if wc in [95, 96, 99]:
        return "CRITICAL", "Active thunderstorm — all outdoor work must stop immediately"
    elif wc in [65, 75, 82]:
        return "HIGH", "Heavy rain/snow — crane and scaffolding operations suspended"
    elif wind > 50:
        return "HIGH", f"High wind speed ({wind:.0f} km/h) — crane operations restricted"
    elif wc in [61, 63, 71, 73, 80, 81]:
        return "MEDIUM", "Moderate rain — surface work and excavation should be paused"
    elif temp < 5 or temp > 42:
        return "MEDIUM", f"Extreme temperature ({temp:.0f}°C) — concrete pouring restricted"
    elif wind > 30:
        return "LOW", f"Moderate wind ({wind:.0f} km/h) — monitor tall structures"
    else:
        return "SAFE", "Conditions are safe for all construction activities"

# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/geocode", summary="Geocode address to GPS coordinates")
async def geocode_address(q: str = Query(..., description="Address or place name to geocode")):
    """Convert an address to GPS coordinates using OpenStreetMap Nominatim (free)."""
    url = f"https://nominatim.openstreetmap.org/search"
    params = {"q": q, "format": "json", "addressdetails": 1, "limit": 5}
    headers = {"User-Agent": "AeroTwin-Platform/1.0 (aerotwin@example.com)"}
    
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            res = await client.get(url, params=params, headers=headers)
            res.raise_for_status()
            data = res.json()
            if not data:
                raise HTTPException(status_code=404, detail="Location not found")
            return [
                {
                    "lat": float(r["lat"]),
                    "lon": float(r["lon"]),
                    "display_name": r["display_name"],
                    "address": r.get("address", {})
                }
                for r in data
            ]
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"Geocoding service error: {str(e)}")

@router.get("/reverse-geocode", summary="Reverse geocode GPS to address")
async def reverse_geocode(lat: float, lon: float):
    """Convert GPS coordinates to a human-readable address."""
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {"lat": lat, "lon": lon, "format": "json", "addressdetails": 1}
    headers = {"User-Agent": "AeroTwin-Platform/1.0 (aerotwin@example.com)"}
    
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            res = await client.get(url, params=params, headers=headers)
            res.raise_for_status()
            data = res.json()
            return {
                "display_name": data.get("display_name", ""),
                "address": data.get("address", {}),
                "lat": lat,
                "lon": lon
            }
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"Reverse geocoding error: {str(e)}")

@router.get("/weather", summary="Live weather + construction risk analysis")
async def get_weather(lat: float, lon: float):
    """Get live weather conditions with construction risk analysis using Open-Meteo (free)."""
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": [
            "temperature_2m", "relative_humidity_2m", "precipitation",
            "weather_code", "wind_speed_10m", "wind_direction_10m", "visibility"
        ],
        "daily": [
            "weather_code", "temperature_2m_max", "temperature_2m_min",
            "precipitation_sum", "wind_speed_10m_max"
        ],
        "forecast_days": 7,
        "timezone": "auto"
    }
    
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            res = await client.get(url, params=params)
            res.raise_for_status()
            data = res.json()
            current = data.get("current", {})
            daily = data.get("daily", {})
            
            risk_level, risk_reason = calculate_construction_risk(current)
            
            # Build 7-day forecast
            forecast = []
            days = daily.get("time", [])
            for i, day in enumerate(days):
                forecast.append({
                    "date": day,
                    "weather_code": daily["weather_code"][i],
                    "weather_desc": WEATHER_CODES.get(daily["weather_code"][i], "Unknown"),
                    "max_temp": daily["temperature_2m_max"][i],
                    "min_temp": daily["temperature_2m_min"][i],
                    "precipitation": daily["precipitation_sum"][i],
                    "max_wind": daily["wind_speed_10m_max"][i],
                })
            
            return {
                "lat": lat,
                "lon": lon,
                "temperature": current.get("temperature_2m", 0),
                "humidity": current.get("relative_humidity_2m", 0),
                "precipitation": current.get("precipitation", 0),
                "weather_code": current.get("weather_code", 0),
                "weather_desc": WEATHER_CODES.get(current.get("weather_code", 0), "Unknown"),
                "wind_speed": current.get("wind_speed_10m", 0),
                "wind_direction": current.get("wind_direction_10m", 0),
                "visibility": current.get("visibility", 10000),
                "construction_risk": risk_level,
                "risk_reason": risk_reason,
                "forecast_7days": forecast
            }
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"Weather service error: {str(e)}")

@router.get("/elevation", summary="Terrain elevation, slope & flood risk")
async def get_elevation(lat: float, lon: float):
    """Get elevation data, slope analysis & flood risk using Open Elevation API (free)."""
    url = "https://api.open-elevation.com/api/v1/lookup"
    payload = {"locations": [{"latitude": lat, "longitude": lon}]}
    
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            res = await client.post(url, json=payload)
            res.raise_for_status()
            data = res.json()
            elevation_m = data["results"][0]["elevation"]
            
            # Calculate slope category and flood risk from elevation
            if elevation_m < 10:
                slope_cat = "Flat (0-2%)"
                flood_risk = "HIGH"
                foundation_rec = "Raft Foundation with waterproofing. Avoid deep basement."
            elif elevation_m < 50:
                slope_cat = "Gentle (2-5%)"
                flood_risk = "MEDIUM"
                foundation_rec = "Strip or Pad Footing. Standard waterproofing."
            elif elevation_m < 200:
                slope_cat = "Moderate (5-15%)"
                flood_risk = "LOW"
                foundation_rec = "Stepped Foundation or Isolated Footings suitable."
            elif elevation_m < 500:
                slope_cat = "Steep (15-30%)"
                flood_risk = "VERY LOW"
                foundation_rec = "Pile Foundation required for slope stability."
            else:
                slope_cat = "Very Steep (>30%)"
                flood_risk = "NEGLIGIBLE"
                foundation_rec = "Rock anchor or Caisson Foundation. Retaining walls needed."
            
            return {
                "lat": lat,
                "lon": lon,
                "elevation_m": elevation_m,
                "slope_category": slope_cat,
                "flood_risk": flood_risk,
                "foundation_recommendation": foundation_rec
            }
        except Exception as e:
            # Fallback with simulated data if API is down
            return {
                "lat": lat,
                "lon": lon,
                "elevation_m": 45.0,
                "slope_category": "Gentle (2-5%)",
                "flood_risk": "MEDIUM",
                "foundation_recommendation": "Strip or Pad Footing. Standard waterproofing.",
                "note": "Simulated data (elevation API unavailable)"
            }

@router.get("/soil", summary="Soil type, bearing capacity & foundation recommendations")
async def get_soil_data(lat: float, lon: float):
    """Get soil data from ISRIC SoilGrids API (free, global coverage)."""
    # ISRIC SoilGrids REST API
    url = "https://rest.isric.org/soilgrids/v2.0/properties/query"
    params = {
        "lon": lon,
        "lat": lat,
        "property": ["clay", "sand", "silt", "soc", "bdod"],
        "depth": ["0-5cm"],
        "value": ["mean"]
    }
    
    async with httpx.AsyncClient(timeout=20) as client:
        try:
            res = await client.get(url, params=params)
            res.raise_for_status()
            data = res.json()
            
            props = {}
            for layer in data.get("properties", {}).get("layers", []):
                name = layer["name"]
                vals = layer.get("depths", [{}])[0].get("values", {})
                props[name] = vals.get("mean", 0)
            
            clay = props.get("clay", 200) / 10  # Convert from g/kg to %
            sand = props.get("sand", 400) / 10
            silt = props.get("silt", 400) / 10
            soc = props.get("soc", 10) / 10  # Organic carbon %
            bdod = props.get("bdod", 1300) / 100  # Bulk density kg/dm3
            
        except Exception:
            # Fallback defaults if API unavailable
            clay, sand, silt, soc, bdod = 25.0, 40.0, 35.0, 1.5, 1.4
        
        # Determine soil type from texture
        if clay > 40:
            soil_type = "Heavy Clay"
            bearing_kpa = 75
            foundation_type = "Raft Foundation required — clay expands with moisture"
            excavation = "HARD — machinery required"
        elif clay > 25:
            soil_type = "Silty Clay Loam"
            bearing_kpa = 100
            foundation_type = "Pad or Strip Footing with DPC membrane"
            excavation = "MODERATE"
        elif sand > 60:
            soil_type = "Sandy Loam"
            bearing_kpa = 150
            foundation_type = "Isolated Column Footings suitable"
            excavation = "EASY — hand digging possible"
        elif silt > 50:
            soil_type = "Silty Loam"
            bearing_kpa = 80
            foundation_type = "Wide Strip Foundation — silt has low bearing capacity"
            excavation = "MODERATE — prone to liquefaction when wet"
        else:
            soil_type = "Loam (Mixed)"
            bearing_kpa = 120
            foundation_type = "Standard Strip or Pad Footing suitable"
            excavation = "EASY"
        
        return {
            "lat": lat,
            "lon": lon,
            "soil_type": soil_type,
            "sand_percent": round(sand, 1),
            "clay_percent": round(clay, 1),
            "silt_percent": round(silt, 1),
            "organic_carbon": round(soc, 2),
            "bulk_density": round(bdod, 2),
            "bearing_capacity_kPa": bearing_kpa,
            "foundation_type": foundation_type,
            "excavation_difficulty": excavation
        }

@router.get("/site-analysis", summary="Complete site analysis combining all environmental APIs")
async def full_site_analysis(lat: float, lon: float, address: Optional[str] = None):
    """
    One-shot endpoint: Combines weather, elevation & soil data for a complete 
    construction site feasibility analysis.
    """
    weather_task = get_weather(lat, lon)
    elevation_task = get_elevation(lat, lon)
    soil_task = get_soil_data(lat, lon)
    
    weather, elevation, soil = await asyncio.gather(
        weather_task, elevation_task, soil_task,
        return_exceptions=True
    )
    
    # Build AI-style risk score
    risks = []
    score = 100
    if not isinstance(weather, Exception):
        if weather.get("construction_risk") == "CRITICAL":
            score -= 40
            risks.append("⛈️ Critical weather event active")
        elif weather.get("construction_risk") == "HIGH":
            score -= 20
            risks.append("🌧️ High weather risk")
        elif weather.get("construction_risk") == "MEDIUM":
            score -= 10
            risks.append("🌦️ Moderate weather risk")
    
    if not isinstance(elevation, Exception):
        if elevation.get("flood_risk") == "HIGH":
            score -= 25
            risks.append("🌊 High flood risk at this elevation")
        elif elevation.get("flood_risk") == "MEDIUM":
            score -= 10
            risks.append("💧 Moderate flood risk")
    
    if not isinstance(soil, Exception):
        if soil.get("bearing_capacity_kPa", 100) < 80:
            score -= 15
            risks.append("🏗️ Weak soil — specialized foundation required")
    
    overall_risk = "EXCELLENT" if score >= 90 else "GOOD" if score >= 70 else "MODERATE" if score >= 50 else "POOR"
    
    return {
        "lat": lat,
        "lon": lon,
        "address": address or "Custom Location",
        "site_score": max(score, 0),
        "overall_rating": overall_risk,
        "risk_factors": risks,
        "weather": weather if not isinstance(weather, Exception) else {"error": str(weather)},
        "elevation": elevation if not isinstance(elevation, Exception) else {"error": str(elevation)},
        "soil": soil if not isinstance(soil, Exception) else {"error": str(soil)},
    }

from typing import List, Dict, Any

BUILDING_TYPOLOGIES: List[Dict[str, Any]] = [
    {
        "type": "family-home",
        "name": "Family Home",
        "description": "Single-storey load-bearing structure with flat RCC slab.",
        "structure": {
            "foundation": "Isolated/strip footing, RCC, 1.0-1.2m depth, M20 concrete",
            "frame": "Load-bearing brick masonry (230mm external)",
            "wallHeight": 3.0,
            "roof": "flat-rcc"
        },
        "floors": [
            {
                "level": 0,
                "rooms": [
                    {
                        "key": "living", "type": "living_room", "label": "Living Room",
                        "grid": [0, 4, 0, 3],
                        "finishes": { "floor": "vitrified-tile", "wallPaint": "warm-beige", "accentWall": "none" },
                        "furniture": ["sofa-3seat", "tv-console", "coffee-table"]
                    },
                    {
                        "key": "kitchen", "type": "kitchen", "label": "Open Kitchen",
                        "grid": [0, 2, 3, 5],
                        "finishes": { "floor": "anti-skid-tile", "wallPaint": "white", "accentWall": "none" },
                        "furniture": ["kitchen-counter", "dining-table-4seat"]
                    },
                    {
                        "key": "bedroom1", "type": "bedroom", "label": "Master Bedroom",
                        "grid": [2, 4, 3, 5],
                        "finishes": { "floor": "laminate-wood", "wallPaint": "sage", "accentWall": "sage" },
                        "furniture": ["bed-double", "wardrobe"]
                    },
                    {
                        "key": "bath1", "type": "bathroom", "label": "Common Bath",
                        "grid": [4, 5, 1, 3],
                        "finishes": { "floor": "anti-skid-ceramic", "wallPaint": "full-tile", "accentWall": "none" },
                        "furniture": ["wc", "vanity-basin", "shower"]
                    }
                ],
                "parking": { "slots": 1, "surface": "paver-blocks" }
            }
        ]
    },
    {
        "type": "villa",
        "name": "Luxury Villa",
        "description": "2-storey RCC framed structure with hybrid roof.",
        "structure": {
            "foundation": "Raft foundation, M25 concrete",
            "frame": "RCC column-beam (300x300 columns)",
            "wallHeight": 3.2,
            "roof": "hybrid-flat-and-pitched"
        },
        "floors": [
            {
                "level": 0,
                "rooms": [
                    {
                        "key": "living", "type": "living_room", "label": "Grand Living Room",
                        "grid": [0, 3, 0, 4],
                        "finishes": { "floor": "engineered-hardwood", "wallPaint": "greige", "accentWall": "stone-cladding" },
                        "furniture": ["sofa-3seat", "coffee-table", "tv-console", "area-rug"]
                    },
                    {
                        "key": "kitchen", "type": "kitchen", "label": "Chef Kitchen",
                        "grid": [3, 5, 0, 2],
                        "finishes": { "floor": "anti-skid-tile", "wallPaint": "white", "accentWall": "none" },
                        "furniture": ["kitchen-island", "kitchen-counter", "fridge"]
                    },
                    {
                        "key": "dining", "type": "dining_room", "label": "Dining Hall",
                        "grid": [3, 5, 2, 4],
                        "finishes": { "floor": "engineered-hardwood", "wallPaint": "greige", "accentWall": "none" },
                        "furniture": ["dining-table-6seat"]
                    }
                ],
                "parking": { "slots": 2, "surface": "epoxy-coated" }
            },
            {
                "level": 1,
                "rooms": [
                    {
                        "key": "master_bed", "type": "bedroom", "label": "Master Suite",
                        "grid": [0, 3, 0, 3],
                        "finishes": { "floor": "carpet-tile", "wallPaint": "muted-blue", "accentWall": "muted-blue" },
                        "furniture": ["bed-king", "bedside-tables", "walk-in-wardrobe"]
                    },
                    {
                        "key": "master_bath", "type": "bathroom", "label": "En-suite Bath",
                        "grid": [3, 5, 0, 2],
                        "finishes": { "floor": "anti-skid-ceramic", "wallPaint": "full-tile", "accentWall": "none" },
                        "furniture": ["wc", "vanity-basin", "bathtub"]
                    },
                    {
                        "key": "guest_bed", "type": "bedroom", "label": "Guest Bedroom",
                        "grid": [0, 3, 3, 5],
                        "finishes": { "floor": "laminate-wood", "wallPaint": "warm-beige", "accentWall": "none" },
                        "furniture": ["bed-double", "wardrobe"]
                    }
                ]
            }
        ]
    },
    {
        "type": "apartment",
        "name": "Apartment Block",
        "description": "Multi-storey RCC framed with shear walls and pile foundation.",
        "structure": {
            "foundation": "Pile foundation with pile cap",
            "frame": "RCC framed structure with shear walls",
            "wallHeight": 3.0,
            "roof": "flat-rcc"
        },
        "floors": [
            {
                "level": 0,
                "rooms": [
                    {
                        "key": "lobby", "type": "common_area", "label": "Entrance Lobby",
                        "grid": [1, 4, 1, 3],
                        "finishes": { "floor": "granite", "wallPaint": "white", "accentWall": "wood-panel" },
                        "furniture": ["reception-desk", "waiting-sofa"]
                    }
                ],
                "parking": { "slots": 20, "surface": "power-floated-concrete" }
            },
            {
                "level": 1,
                "rooms": [
                    {
                        "key": "unit1_living", "type": "living_room", "label": "Unit 101 Living",
                        "grid": [0, 2, 0, 2],
                        "finishes": { "floor": "vitrified-tile", "wallPaint": "taupe", "accentWall": "none" },
                        "furniture": ["sofa-3seat", "tv-console"]
                    },
                    {
                        "key": "unit1_bed", "type": "bedroom", "label": "Unit 101 Bed",
                        "grid": [0, 2, 2, 4],
                        "finishes": { "floor": "laminate-wood", "wallPaint": "white", "accentWall": "none" },
                        "furniture": ["bed-double", "wardrobe"]
                    },
                    {
                        "key": "unit2_living", "type": "living_room", "label": "Unit 102 Living",
                        "grid": [3, 5, 0, 2],
                        "finishes": { "floor": "vitrified-tile", "wallPaint": "taupe", "accentWall": "none" },
                        "furniture": ["sofa-3seat", "tv-console"]
                    },
                    {
                        "key": "unit2_bed", "type": "bedroom", "label": "Unit 102 Bed",
                        "grid": [3, 5, 2, 4],
                        "finishes": { "floor": "laminate-wood", "wallPaint": "white", "accentWall": "none" },
                        "furniture": ["bed-double", "wardrobe"]
                    },
                    {
                        "key": "corridor", "type": "common_area", "label": "Common Corridor",
                        "grid": [2, 3, 0, 4],
                        "finishes": { "floor": "granite", "wallPaint": "white", "accentWall": "none" },
                        "furniture": []
                    }
                ]
            }
        ]
    },
    {
        "type": "commercial",
        "name": "Commercial Complex",
        "description": "Composite steel-concrete frame with curtain wall glazing.",
        "structure": {
            "foundation": "Raft foundation (high load)",
            "frame": "Composite steel-concrete (8m spans)",
            "wallHeight": 3.8,
            "roof": "flat-rcc-services"
        },
        "floors": [
            {
                "level": 0,
                "rooms": [
                    {
                        "key": "retail_lobby", "type": "common_area", "label": "Retail Atrium",
                        "grid": [0, 5, 0, 5],
                        "finishes": { "floor": "granite", "wallPaint": "curtain-wall", "accentWall": "branded-signage" },
                        "furniture": ["reception-desk", "security-gates"]
                    }
                ],
                "parking": { "slots": 50, "surface": "epoxy-coated-concrete" }
            },
            {
                "level": 1,
                "rooms": [
                    {
                        "key": "open_office", "type": "office", "label": "Open Plan Office",
                        "grid": [0, 4, 0, 5],
                        "finishes": { "floor": "raised-access-carpet", "wallPaint": "white", "accentWall": "none" },
                        "furniture": ["workstation-bench", "workstation-bench", "office-chairs"]
                    },
                    {
                        "key": "meeting_room", "type": "office", "label": "Boardroom",
                        "grid": [4, 6, 0, 2],
                        "finishes": { "floor": "raised-access-carpet", "wallPaint": "glass-partition", "accentWall": "none" },
                        "furniture": ["meeting-table", "office-chairs", "tv-screen"]
                    },
                    {
                        "key": "core", "type": "common_area", "label": "Service Core",
                        "grid": [4, 6, 3, 5],
                        "finishes": { "floor": "ceramic-tile", "wallPaint": "white", "accentWall": "none" },
                        "furniture": ["elevators", "restrooms"]
                    }
                ]
            }
        ]
    }
]

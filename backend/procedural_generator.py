import struct
import json
import os
import sys
from pygltflib import GLTF2, Buffer, BufferView, Accessor, Mesh, Primitive, Node, Scene, Material, PbrMetallicRoughness

def generate_building_glb(width, length, floors, style, material_pref, has_pool, has_solar, force_flat, building_type, output_path):
    """
    Procedurally generates a photorealistic 3D building GLB file containing concrete slabs, columns,
    stairs, and style-specific roofs based on input dimensions.
    Sorts elements into named GLTF nodes to allow dynamic visibility toggling:
    - 'structural': footings, columns, beams, slabs, concrete stair steps
    - 'architectural': hollow envelope walls, partition walls, roofs
    - 'windows': glass panels
    - 'doors': entry door
    - 'electrical': orange conduit lines
    - 'plumbing': blue vertical water lines
    - 'hvac': grey ventilation ducts
    - 'lighting': yellow glowing ceiling light meshes
    - 'furniture': sofas, TV, cabinets, toilets, showers, desks
    - 'landscape': compound walls, pool, driveway, garden grass, parked car, trees
    """
    # Master arrays for the binary GLB buffer
    binary_data = bytearray()
    
    # Store accessors, bufferViews, and primitives
    accessors = []
    buffer_views = []
    
    # Organize primitives by category groups
    primitives_by_category = {
        "structural": [],
        "architectural": [],
        "windows": [],
        "doors": [],
        "electrical": [],
        "plumbing": [],
        "hvac": [],
        "lighting": [],
        "interior": [],
        "landscape": []
    }
    
    def add_mesh_primitive(vertices, indices, normals, material_id, category):
        nonlocal binary_data
        
        # 1. Pack Indices (Unsigned Short, 2 bytes each)
        idx_offset = len(binary_data)
        for idx in indices:
            binary_data.extend(struct.pack("<H", idx))
        while len(binary_data) % 4 != 0:
            binary_data.extend(b"\x00")
        idx_length = len(binary_data) - idx_offset
        
        # 2. Pack Positions (Float, 4 bytes each * 3)
        pos_offset = len(binary_data)
        min_pos = [float("inf")] * 3
        max_pos = [float("-inf")] * 3
        for vertex in vertices:
            binary_data.extend(struct.pack("<fff", *vertex))
            for dim in range(3):
                min_pos[dim] = min(min_pos[dim], vertex[dim])
                max_pos[dim] = max(max_pos[dim], vertex[dim])
        while len(binary_data) % 4 != 0:
            binary_data.extend(b"\x00")
        pos_length = len(binary_data) - pos_offset
        
        # 3. Pack Normals (Float, 4 bytes each * 3)
        norm_offset = len(binary_data)
        for norm in normals:
            binary_data.extend(struct.pack("<fff", *norm))
        while len(binary_data) % 4 != 0:
            binary_data.extend(b"\x00")
        norm_length = len(binary_data) - norm_offset
        
        buffer_idx = 0
        
        # Buffer Views
        idx_bv_idx = len(buffer_views)
        buffer_views.append(BufferView(buffer=buffer_idx, byteOffset=idx_offset, byteLength=idx_length, target=34963))
        
        pos_bv_idx = len(buffer_views)
        buffer_views.append(BufferView(buffer=buffer_idx, byteOffset=pos_offset, byteLength=pos_length, target=34962))
        
        norm_bv_idx = len(buffer_views)
        buffer_views.append(BufferView(buffer=buffer_idx, byteOffset=norm_offset, byteLength=norm_length, target=34962))
        
        # Accessors
        idx_acc_idx = len(accessors)
        accessors.append(Accessor(bufferView=idx_acc_idx, byteOffset=0, componentType=5123, count=len(indices), type="SCALAR"))
        
        pos_acc_idx = len(accessors)
        accessors.append(Accessor(bufferView=pos_bv_idx, byteOffset=0, componentType=5126, count=len(vertices), type="VEC3", min=min_pos, max=max_pos))
        
        norm_acc_idx = len(accessors)
        accessors.append(Accessor(bufferView=norm_bv_idx, byteOffset=0, componentType=5126, count=len(normals), type="VEC3"))
        
        # Create Primitive
        prim = Primitive(
            attributes={"POSITION": pos_acc_idx, "NORMAL": norm_acc_idx},
            indices=idx_acc_idx,
            material=material_id
        )
        
        primitives_by_category[category].append(prim)

    # Box Geometry Generator helper
    def build_box(w, h, d, x, y, z, material_id, category):
        v_offset = [
            [-w/2 + x, -h/2 + y,  d/2 + z],
            [ w/2 + x, -h/2 + y,  d/2 + z],
            [ w/2 + x,  h/2 + y,  d/2 + z],
            [-w/2 + x,  h/2 + y,  d/2 + z],
            [-w/2 + x, -h/2 + y, -d/2 + z],
            [ w/2 + x, -h/2 + y, -d/2 + z],
            [ w/2 + x,  h/2 + y, -d/2 + z],
            [-w/2 + x,  h/2 + y, -d/2 + z]
        ]
        
        vertices = []
        normals = []
        indices = []
        
        faces = [
            ([0, 1, 2, 3], [0.0, 0.0, 1.0]),  # Front
            ([5, 4, 7, 6], [0.0, 0.0, -1.0]), # Back
            ([3, 2, 6, 7], [0.0, 1.0, 0.0]),  # Top
            ([1, 0, 4, 5], [0.0, -1.0, 0.0]), # Bottom
            ([1, 5, 6, 2], [1.0, 0.0, 0.0]),  # Right
            ([4, 0, 3, 7], [-1.0, 0.0, 0.0])  # Left
        ]
        
        v_idx = 0
        for f_verts, f_norm in faces:
            for f_v in f_verts:
                vertices.append(v_offset[f_v])
                normals.append(f_norm)
            indices.extend([v_idx, v_idx+1, v_idx+2, v_idx, v_idx+2, v_idx+3])
            v_idx += 4
            
        add_mesh_primitive(vertices, indices, normals, material_id, category)

    # Pyramid Geometry Generator helper (for roofs)
    def build_pyramid(w, h, d, x, y, z, material_id, category):
        v_offset = [
            [-w/2 + x, y,  d/2 + z],
            [ w/2 + x, y,  d/2 + z],
            [ w/2 + x, y, -d/2 + z],
            [-w/2 + x, y, -d/2 + z],
            [ x,       y + h, z ]
        ]
        
        vertices = [v_offset[0], v_offset[1], v_offset[4]]
        normals = [[0, 0.707, 0.707]] * 3
        indices = [0, 1, 2]
        
        vertices.extend([v_offset[1], v_offset[2], v_offset[4]])
        normals.extend([[0.707, 0.707, 0]])
        indices.extend([3, 4, 5])
        
        vertices.extend([v_offset[2], v_offset[3], v_offset[4]])
        normals.extend([[0, 0.707, -0.707]])
        indices.extend([6, 7, 8])
        
        vertices.extend([v_offset[3], v_offset[0], v_offset[4]])
        normals.extend([[-0.707, 0.707, 0]])
        indices.extend([9, 10, 11])
        
        add_mesh_primitive(vertices, indices, normals, material_id, category)

    # Materials setup (PBR compatible factors)
    materials = [
        Material(name="Concrete", pbrMetallicRoughness=PbrMetallicRoughness(baseColorFactor=[0.8, 0.8, 0.8, 1.0], roughnessFactor=0.9, metallicFactor=0.0)),
        Material(name="Steel", pbrMetallicRoughness=PbrMetallicRoughness(baseColorFactor=[0.3, 0.35, 0.4, 1.0], roughnessFactor=0.2, metallicFactor=0.9)),
        Material(name="Glass", pbrMetallicRoughness=PbrMetallicRoughness(baseColorFactor=[0.7, 0.85, 0.95, 0.35], roughnessFactor=0.05, metallicFactor=0.95)),
        Material(name="Wood", pbrMetallicRoughness=PbrMetallicRoughness(baseColorFactor=[0.5, 0.3, 0.15, 1.0], roughnessFactor=0.7, metallicFactor=0.0)),
        Material(name="RoofTiles", pbrMetallicRoughness=PbrMetallicRoughness(baseColorFactor=[0.6, 0.15, 0.15, 1.0], roughnessFactor=0.8, metallicFactor=0.0)),
        Material(name="Water", pbrMetallicRoughness=PbrMetallicRoughness(baseColorFactor=[0.05, 0.5, 0.8, 0.8], roughnessFactor=0.1, metallicFactor=0.95)),
        Material(name="Grass", pbrMetallicRoughness=PbrMetallicRoughness(baseColorFactor=[0.1, 0.4, 0.15, 1.0], roughnessFactor=1.0, metallicFactor=0.0)),
        Material(name="ElectricalOrange", pbrMetallicRoughness=PbrMetallicRoughness(baseColorFactor=[1.0, 0.5, 0.0, 1.0], roughnessFactor=0.5, metallicFactor=0.2)),
        Material(name="PlumbingBlue", pbrMetallicRoughness=PbrMetallicRoughness(baseColorFactor=[0.0, 0.5, 1.0, 1.0], roughnessFactor=0.5, metallicFactor=0.2)),
        Material(name="HVACGrey", pbrMetallicRoughness=PbrMetallicRoughness(baseColorFactor=[0.6, 0.6, 0.6, 1.0], roughnessFactor=0.4, metallicFactor=0.7)),
        Material(name="YellowLight", pbrMetallicRoughness=PbrMetallicRoughness(baseColorFactor=[1.0, 1.0, 0.6, 1.0], roughnessFactor=0.1, metallicFactor=0.1)),
        Material(name="CarPaintRed", pbrMetallicRoughness=PbrMetallicRoughness(baseColorFactor=[0.8, 0.0, 0.0, 1.0], roughnessFactor=0.2, metallicFactor=0.9)),
        Material(name="Marble", pbrMetallicRoughness=PbrMetallicRoughness(baseColorFactor=[0.95, 0.95, 0.93, 1.0], roughnessFactor=0.08, metallicFactor=0.1)),
        Material(name="PlasterWhite", pbrMetallicRoughness=PbrMetallicRoughness(baseColorFactor=[0.9, 0.9, 0.9, 1.0], roughnessFactor=0.95, metallicFactor=0.0))
    ]

    wall_mat = 13 # default plasterwhite
    if material_pref == "Wood":
        wall_mat = 3
    elif material_pref == "Steel":
        wall_mat = 1
    elif material_pref == "Glass":
        wall_mat = 2

    # --- BUILD PROCEDURAL SCENE ---
    floor_height = 3.0
    total_height = floors * floor_height
    
    bWidth = width
    bLength = length

    # 1. Structural Layer: Floor Marble Slabs, Columns, Beams, Footings, Concrete Stairs
    for f in range(floors):
        # Marble Floor slabs
        build_box(bWidth, 0.15, bLength, 0.0, f * floor_height + 0.075, 0.0, 12, "structural")
        # Ceiling slabs
        build_box(bWidth, 0.15, bLength, 0.0, (f + 1) * floor_height - 0.075, 0.0, 0, "structural")
        
        # Concrete staircase steps connecting floors (except warehouse/factory)
        if f < floors - 1 and building_type not in ["Warehouse", "Factory"]:
            num_steps = 12
            step_w = 1.3
            step_h = floor_height / num_steps
            step_d = bLength * 0.35 / num_steps
            for step in range(num_steps):
                build_box(
                    step_w, step_h, step_d,
                    -bWidth/2 + step_w/2 + 0.2,
                    f * floor_height + step * step_h + step_h/2,
                    -bLength/3 + step * step_d,
                    0, "structural"
                )

    # Columns grid
    col_spacing = 4.5
    cols_x = max(2, int(bWidth / col_spacing) + 1)
    cols_z = max(2, int(bLength / col_spacing) + 1)
    
    for x in range(cols_x):
        x_pos = (x - (cols_x - 1) / 2) * (bWidth / max(1, cols_x - 1))
        for z in range(cols_z):
            z_pos = (z - (cols_z - 1) / 2) * (bLength / max(1, cols_z - 1))
            # Footing pads
            build_box(0.8, 0.4, 0.8, x_pos, -0.2, z_pos, 0, "structural")
            # Concrete Column pillars
            build_box(0.25, total_height, 0.25, x_pos, total_height / 2, z_pos, 1, "structural")
            
    # Horizontal Beams
    for f in range(floors):
        y_pos = (f + 1) * floor_height
        build_box(0.3, 0.4, bLength, bWidth / 2, y_pos, 0.0, 1, "structural")
        build_box(0.3, 0.4, bLength, -bWidth / 2, y_pos, 0.0, 1, "structural")
        build_box(bWidth, 0.4, 0.3, 0.0, y_pos, bLength / 2, 1, "structural")
        build_box(bWidth, 0.4, 0.3, 0.0, y_pos, -bLength / 2, 1, "structural")

    # 2. Architectural Layer: Hollow Envelope Walls with Thickness & Partition Walls
    wall_thickness = 0.25
    for f in range(floors):
        yBase = f * floor_height
        # Left wall
        build_box(wall_thickness, floor_height, bLength, -bWidth/2 + wall_thickness/2, yBase + floor_height/2, 0.0, wall_mat, "architectural")
        # Right wall
        build_box(wall_thickness, floor_height, bLength, bWidth/2 - wall_thickness/2, yBase + floor_height/2, 0.0, wall_mat, "architectural")
        # Back wall
        build_box(bWidth, floor_height, wall_thickness, 0.0, yBase + floor_height/2, -bLength/2 + wall_thickness/2, wall_mat, "architectural")
        
        # Front wall: Hollowed out in segments to allow door/window openings
        if f == 0:
            if building_type in ["Warehouse", "Factory"]:
                # Roller shutter garage opening (large doors)
                build_box(bWidth/2 - 2.0, floor_height, wall_thickness, -bWidth/4 - 1.0, yBase + floor_height/2, bLength/2 - wall_thickness/2, wall_mat, "architectural")
                build_box(bWidth/2 - 2.0, floor_height, wall_thickness, bWidth/4 + 1.0, yBase + floor_height/2, bLength/2 - wall_thickness/2, wall_mat, "architectural")
                # Lintel above roller door
                build_box(4.0, floor_height - 2.5, wall_thickness, 0.0, yBase + 2.5 + (floor_height - 2.5)/2, bLength/2 - wall_thickness/2, wall_mat, "architectural")
            else:
                # Standard door opening
                build_box(bWidth/2 - 1.0, floor_height, wall_thickness, -bWidth/4 - 0.5, yBase + floor_height/2, bLength/2 - wall_thickness/2, wall_mat, "architectural")
                build_box(bWidth/2 - 1.0, floor_height, wall_thickness, bWidth/4 + 0.5, yBase + floor_height/2, bLength/2 - wall_thickness/2, wall_mat, "architectural")
                # Lintel
                build_box(2.0, floor_height - 2.2, wall_thickness, 0.0, yBase + 2.2 + (floor_height - 2.2)/2, bLength/2 - wall_thickness/2, wall_mat, "architectural")
        else:
            # Upper floor window frames
            build_box(bWidth/2 - 1.2, floor_height, wall_thickness, -bWidth/4 - 0.6, yBase + floor_height/2, bLength/2 - wall_thickness/2, wall_mat, "architectural")
            build_box(bWidth/2 - 1.2, floor_height, wall_thickness, bWidth/4 + 0.6, yBase + floor_height/2, bLength/2 - wall_thickness/2, wall_mat, "architectural")
            build_box(2.4, 0.8, wall_thickness, 0.0, yBase + 0.4, bLength/2 - wall_thickness/2, wall_mat, "architectural")
            build_box(2.4, 0.8, wall_thickness, 0.0, yBase + 2.6, bLength/2 - wall_thickness/2, wall_mat, "architectural")

        # Inner Partition Room dividers (omit completely for Warehouse / Factory)
        if building_type not in ["Warehouse", "Factory"]:
            if building_type in ["Hospital", "School"]:
                # Central corridor divider
                build_box(bWidth * 0.9, floor_height, 0.15, 0.0, yBase + floor_height/2, 0.0, 13, "architectural")
                # Sub-divided rooms branching out
                build_box(0.15, floor_height, bLength * 0.45, -bWidth/4, yBase + floor_height/2, bLength/4, 13, "architectural")
                build_box(0.15, floor_height, bLength * 0.45, bWidth/4, yBase + floor_height/2, bLength/4, 13, "architectural")
            elif building_type == "Office":
                # Cubicle partition screens (1.5m half-height partitions)
                build_box(0.1, 1.5, bLength * 0.7, -bWidth/5, yBase + 0.75, 0.0, 3, "architectural")
                build_box(0.1, 1.5, bLength * 0.7, bWidth/5, yBase + 0.75, 0.0, 3, "architectural")
            else:
                # Standard Domestic home partitions
                build_box(0.15, floor_height, bLength * 0.55, -bWidth/6, yBase + floor_height/2, 0.0, 13, "architectural")
                build_box(bWidth * 0.4, floor_height, 0.15, bWidth/6, yBase + floor_height/2, -bLength/8, 13, "architectural")

    # Roof configurations
    is_traditional = (style == "Traditional") and not force_flat
    if is_traditional:
        build_pyramid(bWidth + 0.5, 2.5, bLength + 0.5, 0.0, total_height, 0.0, 4, "architectural")
    else:
        # Flat Roof
        build_box(bWidth, 0.3, bLength, 0.0, total_height + 0.15, 0.0, 0, "architectural")
        if has_solar:
            build_box(bWidth * 0.3, 0.05, bLength * 0.3, -bWidth * 0.2, total_height + 0.32, -bLength * 0.2, 1, "architectural")
            build_box(bWidth * 0.3, 0.05, bLength * 0.3, bWidth * 0.2, total_height + 0.32, bLength * 0.2, 1, "architectural")

    # 3. Windows Layer
    numWindowsX = max(1, int(bWidth / 3))
    numWindowsZ = max(1, int(bLength / 4))
    for f in range(floors):
        yPos = (f * floor_height) + (floor_height / 2)
        if f > 0:
            build_box(2.4, 1.4, 0.08, 0.0, yPos, bLength/2 - 0.1, 2, "windows")
        for i in range(numWindowsZ):
            zPos = (i - numWindowsZ / 2 + 0.5) * 3.5
            build_box(0.08, 1.5, 1.2, bWidth / 2 - 0.1, yPos, zPos, 2, "windows")
            build_box(0.08, 1.5, 1.2, -bWidth / 2 + 0.1, yPos, zPos, 2, "windows")

    # 4. Doors Layer (Roller steel doors for warehouse, double doors otherwise)
    if building_type in ["Warehouse", "Factory"]:
        build_box(3.8, 2.4, 0.1, 0.0, 1.2, bLength / 2 - 0.1, 1, "doors")
    else:
        build_box(1.6, 2.2, 0.1, 0.0, 1.1, bLength / 2 - 0.1, 3, "doors")

    # 5. Electrical Layer (Orange Conduits running along columns)
    for x in range(cols_x):
        x_pos = (x - (cols_x - 1) / 2) * (bWidth / max(1, cols_x - 1))
        for z in range(cols_z):
            z_pos = (z - (cols_z - 1) / 2) * (bLength / max(1, cols_z - 1))
            build_box(0.04, total_height, 0.04, x_pos + 0.2, total_height / 2, z_pos + 0.2, 7, "electrical")

    # 6. Plumbing Layer (Blue vertical pipes running in utility blocks/corners)
    build_box(0.06, total_height, 0.06, -bWidth / 2.2, total_height / 2, -bLength / 2.2, 8, "plumbing")
    build_box(0.06, total_height, 0.06, bWidth / 2.2, total_height / 2, -bLength / 2.2, 8, "plumbing")

    # 7. HVAC Layer (Ventilation duct boxes running horizontally under slabs)
    for f in range(floors):
        y_pos = (f + 1) * floor_height - 0.25
        build_box(0.4, 0.2, bLength * 0.9, 0.0, y_pos, 0.0, 9, "hvac")

    # 8. Lighting Layer (Yellow light globes suspended under slabs)
    for f in range(floors):
        y_pos = (f + 1) * floor_height - 0.15
        build_box(0.15, 0.15, 0.15, 0.0, y_pos, 0.0, 10, "lighting")
        build_box(0.15, 0.15, 0.15, -bWidth / 4, y_pos, -bLength / 4, 10, "lighting")
        build_box(0.15, 0.15, 0.15, bWidth / 4, y_pos, bLength / 4, 10, "lighting")

    # 9. Interior/Furniture Layer: Load specialized assets based on Building Type
    for f in range(floors):
        yBase = f * floor_height
        
        if building_type in ["Warehouse", "Factory"]:
            # Industrial high racks
            build_box(1.0, 2.4, 3.8, -bWidth/3.2, yBase + 1.2, 0.0, 1, "interior")
            build_box(1.0, 2.4, 3.8, bWidth/3.2, yBase + 1.2, 0.0, 1, "interior")
        elif building_type == "Office":
            # Cubicle desks & chairs
            build_box(1.2, 0.75, 0.6, -bWidth/4, yBase + 0.38, -bLength/4, 3, "interior")
            build_box(1.2, 0.75, 0.6, -bWidth/4, yBase + 0.38, bLength/4, 3, "interior")
            build_box(1.2, 0.75, 0.6, bWidth/4, yBase + 0.38, -bLength/4, 3, "interior")
            build_box(1.2, 0.75, 0.6, bWidth/4, yBase + 0.38, bLength/4, 3, "interior")
        elif building_type == "Hospital":
            # Medical patient beds
            build_box(0.9, 0.8, 2.0, -bWidth/4, yBase + 0.4, -bLength/4, 12, "interior")
            build_box(0.9, 0.8, 2.0, -bWidth/4, yBase + 0.4, bLength/4, 12, "interior")
            build_box(0.9, 0.8, 2.0, bWidth/4, yBase + 0.4, -bLength/4, 12, "interior")
            build_box(0.9, 0.8, 2.0, bWidth/4, yBase + 0.4, bLength/4, 12, "interior")
        elif building_type == "School":
            # Classroom student benches & blackboard
            build_box(3.2, 1.2, 0.04, 0.0, yBase + 1.4, -bLength/2.1, 1, "interior") # blackboard
            # Rows of benches
            build_box(1.8, 0.7, 0.6, -bWidth/4, yBase + 0.35, -bLength/8, 3, "interior")
            build_box(1.8, 0.7, 0.6, bWidth/4, yBase + 0.35, -bLength/8, 3, "interior")
            build_box(1.8, 0.7, 0.6, -bWidth/4, yBase + 0.35, bLength/4, 3, "interior")
            build_box(1.8, 0.7, 0.6, bWidth/4, yBase + 0.35, bLength/4, 3, "interior")
        else:
            # Default domestic Home / Villa furniture
            if f == 0:
                build_box(1.8, 0.7, 0.8, 0.0, yBase + 0.35, 0.0, 3, "interior")
                build_box(1.2, 0.5, 0.8, 0.0, yBase + 0.25, 1.2, 3, "interior")
                build_box(1.4, 0.8, 0.05, 0.0, yBase + 1.5, -bLength / 2.1, 1, "interior")
                build_box(bWidth * 0.3, 0.9, 0.6, -bWidth / 3, yBase + 0.45, bLength / 3, 3, "interior")
            else:
                build_box(1.5, 0.8, 2.0, -bWidth/4, yBase + 0.4, -bLength/4, 3, "interior")
                build_box(1.5, 0.8, 2.0, bWidth/4, yBase + 0.4, bLength/4, 3, "interior")
                build_box(1.2, 0.75, 0.6, -bWidth/4, yBase + 0.38, bLength/4, 3, "interior")

    # 10. Landscape Layer: Compound Wall, Pool, Driveway, Garden, parked car, trees
    build_box(width, 1.5, 0.25, 0.0, 0.75, -length / 2, 0, "landscape")
    build_box(0.25, 1.5, length, -width / 2, 0.75, 0.0, 0, "landscape")
    build_box(0.25, 1.5, length, width / 2, 0.75, 0.0, 0, "landscape")
    build_box(width / 2 - 3, 1.5, 0.25, (-width / 4) - 1.5, 0.75, length / 2, 0, "landscape")
    build_box(width / 2 - 3, 1.5, 0.25, (width / 4) + 1.5, 0.75, length / 2, 0, "landscape")
    
    # Driveway & Grass
    build_box(3.0, 0.02, length / 2, 0.0, -0.14, length / 4, 1, "landscape")
    
    if has_pool or (width - bWidth > 12):
        build_box(max(3.0, (width - bWidth)/3), 0.1, max(5.0, bLength * 0.65), bWidth / 2 + (width - bWidth) / 4, -0.13, 0.0, 5, "landscape")
        
    build_box(max(3.0, (width - bWidth)/3), 0.02, max(5.0, bLength * 0.65), -bWidth / 2 - (width - bWidth) / 4, -0.14, 0.0, 6, "landscape")
    
    # Parked Car in driveway
    build_box(1.8, 0.8, 3.8, 0.0, 0.3, length / 3, 11, "landscape")
    
    # Decorative trees
    build_box(0.2, 2.5, 0.2, -width/2.5, 1.25, -length/2.5, 3, "landscape")
    build_box(1.5, 1.5, 1.5, -width/2.5, 2.5, -length/2.5, 6, "landscape")

    # --- COMPILE SCENE NODES ---
    meshes = []
    nodes = []
    
    for category, prim_list in primitives_by_category.items():
        if not prim_list:
            continue
        mesh_idx = len(meshes)
        meshes.append(Mesh(name=category, primitives=prim_list))
        nodes.append(Node(name=category, mesh=mesh_idx))
        
    gltf = GLTF2(
        scene=0,
        scenes=[Scene(nodes=list(range(len(nodes))))],
        nodes=nodes,
        meshes=meshes,
        materials=materials,
        accessors=accessors,
        bufferViews=buffer_views,
        buffers=[Buffer(byteLength=len(binary_data))]
    )
    
    gltf.set_binary_blob(binary_data)
    gltf.save(output_path)

if __name__ == "__main__":
    if len(sys.argv) < 11:
        print("Usage: python procedural_generator.py <width> <length> <floors> <style> <material> <pool> <solar> <flat> <building_type> <output_path>")
        sys.exit(1)
        
    w = float(sys.argv[1])
    l = float(sys.argv[2])
    fl = int(sys.argv[3])
    st = sys.argv[4]
    mat = sys.argv[5]
    po = sys.argv[6].lower() == "true"
    sol = sys.argv[7].lower() == "true"
    flt = sys.argv[8].lower() == "true"
    btype = sys.argv[9]
    out = sys.argv[10]
    
    generate_building_glb(w, l, fl, st, mat, po, sol, flt, btype, out)

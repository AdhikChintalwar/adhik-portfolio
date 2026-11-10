import bpy, os, math
from mathutils import Vector
# Run using: blender -b "model-source/source/Porsche 911 gt3 rs.blend" --python scripts/export_gt3.py
root=os.path.abspath(os.getcwd())
output=os.path.join(root,'public','models','porsche-911-gt3-rs.glb')
os.makedirs(os.path.dirname(output),exist_ok=True)
# Keep original geometry, UVs, materials, textures, and names.
# Blender embeds available images into the GLB.
for image in bpy.data.images:
    if image.source == 'FILE' and not image.packed_file:
        name=os.path.basename(bpy.path.abspath(image.filepath))
        candidate=os.path.join(root,'model-source','textures',name)
        if os.path.exists(candidate):image.filepath=candidate
for obj in bpy.context.scene.objects:
    if obj.type in {'MESH','EMPTY'}:obj.hide_render=False
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.context.scene.objects:
    if obj.type in {'MESH','EMPTY'}:obj.select_set(True)
# GLB export preserves object names for wheel/steering detection in the website.
bpy.ops.export_scene.gltf(filepath=output,export_format='GLB',use_selection=True,export_apply=False,export_yup=True,export_materials='EXPORT',export_image_format='AUTO')
print('EXPORTED:',output,os.path.getsize(output),'bytes')

def admin_shopcategory_save(category, content, meta_description, view_count, available_display):
    if content:
        category.content = content
    if meta_description:
        category.meta_description = meta_description
    if view_count:
        category.view_count = view_count
    print('available_display == "y":', available_display)
    if available_display is not None:
        category.available_display = True
    else:
        category.available_display = False

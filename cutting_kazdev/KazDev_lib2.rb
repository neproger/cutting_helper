module KazDev
    module KazDev_lib2

        def get_file_info()
            model = Sketchup.active_model
            file_path = model.path
            file_name = File.basename(file_path)
            return {
                file_name: file_name,
                file_path: file_path,
            }
        end

        def get_layers()
            model = Sketchup.active_model
            layers_info = []
            model.layers.each do |layer|
                obj = {
                    label: layer.name,
                    id: layer.persistent_id,
                    # Добавьте другие свойства слоя, если необходимо
                }
            
                if layer.attribute_dictionaries && layer.attribute_dictionaries["KazDev"]
                    attributes = layer.attribute_dictionaries["KazDev"]
                    # Переносим атрибуты из словаря в объект
                    attributes.each do |key, value|
                        obj[key.to_s] = value
                        
                    end
                end

                
                layers_info << obj
            end
          
            return layers_info
        end

        def createDataObj(ent)
            return unless ent.is_a?(Sketchup::Group) || ent.is_a?(Sketchup::ComponentInstance)

            dimensions = get_dimensions(ent)
            return unless dimensions[:x] >= 1 && dimensions[:y] >= 1

            dictionary = ent.attribute_dictionary("KazDev")
            
            obj = {
                type: "parts",
                height: dimensions[:x],
                width: dimensions[:y],
                depth: dimensions[:z],
                faces: {
                    front: dimensions[:front],   # Передняя грань
                    back: dimensions[:back],     # Задняя грань
                    top: dimensions[:top],       # Верхняя грань
                    bottom: dimensions[:bottom], # Нижняя грань
                    left: dimensions[:left],     # Левая грань
                    right: dimensions[:right]    # Правая грань
                },
                id: ent.persistent_id,
                label: ent.layer.display_name,
                layer_id: ent.layer.persistent_id,
            }
            
            if dictionary
                rotation = dictionary.get_attribute('rotation', false)
                
                if rotation
                    # puts "rotation: #{rotation.to_s}"
                    obj['height'], obj['width'] = obj['width'], obj['height']
                end 

                dictionary.each_pair do |key, value|
                    # puts "Key: #{key}, Value: #{value}"
                    obj[key] = value
                end
            end
            

            return obj
        end

        def get_dimensions(ent)
            return unless ent.is_a?(Sketchup::Group) || ent.is_a?(Sketchup::ComponentInstance)
            transformation = ent.transformation

            model = Sketchup.active_model
            entities = model.active_entities

            rotation = ent.get_attribute('KazDev', "rotation", false)
            tr = Geom::Transformation.axes(ORIGIN, X_AXIS, Y_AXIS, Z_AXIS)
            entity = entities.add_instance(ent.definition, tr)
            entity.make_unique
            entities.transform_entities(tr, [entity]) 

            matrix = transformation.to_a
            scaling_x = Math.sqrt(matrix[0] * matrix[0] + matrix[1] * matrix[1] + matrix[2] * matrix[2])
            scaling_y = Math.sqrt(matrix[4] * matrix[4] + matrix[5] * matrix[5] + matrix[6] * matrix[6])
            scaling_z = Math.sqrt(matrix[8] * matrix[8] + matrix[9] * matrix[9] + matrix[10] * matrix[10])
            scaling_transform = Geom::Transformation.scaling(ORIGIN, scaling_x, scaling_y, scaling_z)
            entities.transform_entities(scaling_transform, [entity])
            bBox = entity.bounds
            

            transformation = ent.transformation
            entity.erase!

            b_x = bBox.width.to_mm.round
            b_y = bBox.height.to_mm.round
            b_z = bBox.depth.to_mm.round
            
            x = 0
            y = 0
            z = 0
            orientation = []
            corners = [
                bBox.corner(0), # - 0 = [0, 0, 0] (left front bottom) 
                bBox.corner(1), # - 1 = [1, 0, 0] (right front bottom)
                bBox.corner(2), # - 2 = [0, 1, 0] (left back bottom)
                bBox.corner(3), # - 3 = [1, 1, 0] (right back bottom)
                bBox.corner(4), # - 4 = [0, 0, 1] (left front top)
                bBox.corner(5), # - 5 = [1, 0, 1] (right front top)
                bBox.corner(6), # - 6 = [0, 1, 1] (left back top)
                bBox.corner(7)  # - 7 = [1, 1, 1] (right back top)
            ]
            # Вычисляем коэффициенты масштаба
            scale_x = Math.sqrt(transformation.to_a[0]**2 + transformation.to_a[1]**2 + transformation.to_a[2]**2)
            scale_y = Math.sqrt(transformation.to_a[4]**2 + transformation.to_a[5]**2 + transformation.to_a[6]**2)
            scale_z = Math.sqrt(transformation.to_a[8]**2 + transformation.to_a[9]**2 + transformation.to_a[10]**2)

            scaling_transform = Geom::Transformation.scaling(ORIGIN, 1.0 / scale_x, 1.0 / scale_y, 1.0 / scale_z)
            corners.each do |corner|
                corner.transform!(transformation)
            end
            case [b_x, b_y, b_z].min
            when b_x
                # Вертикальная ориентация
                y = b_y
                x = b_z
                z = b_x
                orientation = "vertical"  # Вертикальная ориентация
                front = [corners[1], corners[3], corners[7], corners[5]]
                back = [corners[2], corners[0], corners[4], corners[6]]
                right = [corners[5], corners[7], corners[6], corners[4]]
                left = [corners[0], corners[2], corners[3], corners[1]]
                bottom = [corners[3], corners[2], corners[6], corners[7]]
                top = [corners[0], corners[1], corners[5], corners[4]]
            
            when b_z
                # Горизонтальная ориентация
                y = b_y
                x = b_x
                z = b_z
                orientation = "horizontal"  # Горизонтальная ориентация
                front = [corners[6], corners[4], corners[5], corners[7]]
                back = [corners[0], corners[2], corners[3], corners[1]]
                top = [corners[4], corners[5], corners[1], corners[0]]
                bottom = [corners[6], corners[7], corners[3], corners[2]]
                right = [corners[0], corners[2], corners[6], corners[4]]
                left = [corners[1], corners[3], corners[7], corners[5]]
            
            when b_y
                # Лицевая (фронтальная) ориентация
                y = b_x
                x = b_z
                z = b_y
                orientation = "frontal"  # Лицевая ориентация
                front = [corners[0], corners[1], corners[5], corners[4]]
                back = [corners[2], corners[3], corners[7], corners[6]]
                top = [corners[4], corners[5], corners[7], corners[6]]
                bottom = [corners[0], corners[1], corners[3], corners[2]]
                right = [corners[0], corners[2], corners[6], corners[4]]
                left = [corners[1], corners[3], corners[7], corners[5]]
            end
            

            if rotation
                temp = x
                x = y
                y = temp
            end

            return {
                x: x,
                y: y,
                z: z,
                front: front,
                back: back,
                top: top,
                bottom: bottom,
                left: left,
                right: right,
            }
        end

        def get_entity_dimensions(entity)
            bounding_box = entity.bounds
            
            # Получаем размеры по осям X, Y и Z
            size_x = bounding_box.width
            size_y = bounding_box.height
            size_z = bounding_box.depth
        
            {
                size_x: size_x,
                size_y: size_y,
                size_z: size_z
            }
        end

        def draw_rectangle( y, x, height, width, id, rotated)
            model = Sketchup.active_model
            entities = model.active_entities
        
            # Создаем точки для прямоугольника
            pt1 = Geom::Point3d.new(y.mm, x.mm, 0)
            pt2 = Geom::Point3d.new(y.mm, (x + width).mm, 0)
            pt3 = Geom::Point3d.new((y + height).mm, (x + width).mm, 0)
            pt4 = Geom::Point3d.new((y + height).mm, x.mm, 0)
        
            # Добавляем лицо и создаем группу
            face = entities.add_face(pt1, pt2, pt3, pt4)
            face.reverse!
            group = entities.add_group(face)
            
            unless group
                UI.messagebox("Не удалось создать прямоугольник!")
                model.abort_operation
                return
            end
            
            group.set_attribute("KazDev", "part_id", id)
            group.name = id.to_s
        
            # Поиск сущности по ID и проверка типа
            entity = find_entity_by_persistent_id(model, id)
            return unless entity.is_a?(Sketchup::Group) || entity.is_a?(Sketchup::ComponentInstance)
            
            # Добавляем новый экземпляр сущности в группу
            reset_transformation = Geom::Transformation.axes(ORIGIN, X_AXIS, Y_AXIS, Z_AXIS)
            new_instance = group.entities.add_instance(entity.definition, reset_transformation)
            new_instance.make_unique

            if face && face.valid?
                edges = face.edges
                face.erase!
                edges.each do |edge|
                    edge.erase! if edge.valid? && edge.faces.empty?
                end
            end

            # Масштабируем сущность
            scaling_transform = get_scaling_transform(entity)
            new_instance.transform!(scaling_transform)
        
            dimensions = get_entity_dimensions(new_instance)
            min_dimension = [dimensions[:size_x], dimensions[:size_y], dimensions[:size_z]].min

            case min_dimension
            when dimensions[:size_x]
                puts "Минимальное измерение: X (#{dimensions[:size_x]})"
                rotation = Geom::Transformation.rotation(ORIGIN, Y_AXIS, 90.degrees)
                new_instance.transform!(rotation)
            when dimensions[:size_y]
                puts "Минимальное измерение: Y (#{dimensions[:size_y]})"
                rotation = Geom::Transformation.rotation(ORIGIN, X_AXIS, 90.degrees)
                new_instance.transform!(rotation)
                # Дополнительные действия, если Y является минимальным
            when dimensions[:size_z]
                puts "Минимальное измерение: Z (#{dimensions[:size_z]})"
                rotation = Geom::Transformation.rotation(ORIGIN, Z_AXIS, 90.degrees)
                new_instance.transform!(rotation)
            else
                puts "Не удалось определить минимальное измерение"
            end

            dimensions = get_entity_dimensions(new_instance)
            instWidth = dimensions[:size_x]
            instHeight = dimensions[:size_y]

            if (width > height && instWidth > instHeight) || (width < height && instWidth < instHeight)
                puts "Поворот по: Z"
                rotation = Geom::Transformation.rotation(ORIGIN, Z_AXIS, 90.degrees)
                new_instance.transform!(rotation)
            end

            smallest_position = get_smallest_position(new_instance)
            if smallest_position
                translation_vector = Geom::Vector3d.new(ORIGIN - smallest_position)
                translation = Geom::Transformation.translation(translation_vector)
                new_instance.transform!(translation)
            end

            group.to_component
        
            puts "DONE"
        end

        def get_smallest_position(instance)
            # Получаем BoundingBox для инстанса
            bounding_box = instance.bounds
        
            # Получаем минимальную точку в BoundingBox
            smallest_position = bounding_box.min
        
            smallest_position
        end

        def get_scaling_transform(entity)
            transformation = entity.transformation
            matrix = transformation.to_a
            scaling_x = Math.sqrt(matrix[0] * matrix[0] + matrix[1] * matrix[1] + matrix[2] * matrix[2])
            scaling_y = Math.sqrt(matrix[4] * matrix[4] + matrix[5] * matrix[5] + matrix[6] * matrix[6])
            scaling_z = Math.sqrt(matrix[8] * matrix[8] + matrix[9] * matrix[9] + matrix[10] * matrix[10])
            Geom::Transformation.scaling(ORIGIN, scaling_x, scaling_y, scaling_z)
        end

        def find_entity_by_persistent_id(model, persistent_id)
            model.entities.each do |entity|
                if entity.persistent_id == persistent_id
                    # Возвращаем сущность, если найдена
                    return entity
                end
            end
            return nil
        end

        def set_data_array(array, model = nil)
            model ||= Sketchup.active_model
            entities = model.active_entities
            layers = model.layers
            objects = []
          
            array.each do |data|
                type = data['type']
                id = data['id']
                name = data['name']
                param = data['param']
                entity = entities.find { |e| e.persistent_id == id.to_i }
          
              if entity
                    entity.set_attribute('KazDev', name, param)
                    data_obj = createDataObj(entity)
                    objects.push(data_obj)
              else
                    layer = layers.find { |l| l.persistent_id == id.to_i }
                    if layer
                    layer.set_attribute('KazDev', name, param)
                    data = {
                        layer: layer.persistent_id,
                        name: name,
                        value: layer.get_attribute('KazDev', name),
                        id: layer.persistent_id,
                        type: "layers"
                    }
                    $wd.execute_script("stateAction({
                        action: 'edit',
                        data: #{data.to_json},
                    })")
                    next
                end
              end
            end
          
            $wd.execute_script("stateAction({
                action: 'set_parts',
                data: #{objects.to_json},
                })")
        end
          

        def set_data(type, id, name, param)
            puts "set_data(#{type}, #{id}, #{name}, #{param})"
            model = Sketchup.active_model
            view = model.active_view
            case type
                when 'parts'
                    # Обработка объекта
                    entities = model.active_entities
                    entity = entities.find { |e| e.persistent_id == id.to_i }
                    entity.set_attribute('KazDev', name, param)
                    # puts "тип 'entity' индекс '#{id}' параметр '#{name}' значение '#{param}'"

                    data = createDataObj(entity)
                    unless $wd
                        return
                    end
                    $wd.execute_script("stateAction({
                        action: 'set_parts',
                        data: #{[data].to_json},
                    })")
                when 'layers'
                    # Обработка слоя
                    layers = model.layers
                    layer = layers.find { |l| l.persistent_id == id.to_i }
                    layer.set_attribute('KazDev', name, param)
                    # puts "тип 'layer' индекс '#{id}' параметр '#{name}' значение '#{param}'"

                    data = {
                        layer: layer.persistent_id,
                        name: name,
                        value: layer.get_attribute('KazDev', name),
                        id: layer.persistent_id,
                        type: "layers"
                    }
                    $wd.execute_script("stateAction({
                        action: 'edit',
                        data: #{data.to_json},
                    })")
                when 'materials'
                    puts "тип 'materials' индекс '#{id}' параметр '#{name}' значение '#{param}'"
                else
                    puts "Invalid type: #{type}."
            end
            view.invalidate
            
        end

        def select_entity(id)
            # Получаем активную модель SketchUp
            model = Sketchup.active_model
            entities = model.entities
            selection = model.selection
            selection.clear
            tools = model.tools
            tool = tools.active_tool
            
            if id.is_a?(Array)
                id.each do |id|
                    # Поиск объекта по атрибуту "part_id"
                    entity0 = entities.find { |e| e.get_attribute("KazDev", "part_id") == id }
                    entity1 = entities.find { |e| e.persistent_id == id }
                    # Если объект найден, выделяем его
                    if tool.is_a?(KazDev::Cutting_Kazdev::Cutting_Tool)
                        puts "Active tool is a Cutting_Tool"
                        tool.handle_entity_selection(entity0) if entity0
                    else
                        puts "Active tool is not a Cutting_Tool"
                        selection.add(entity0) if entity0
                        selection.add(entity1) if entity1
                    end
                end
            else
                # Поиск объекта по атрибуту "part_id"
                entity0 = entities.find { |e| e.get_attribute("KazDev", "part_id") == id }
                entity1 = entities.find { |e| e.persistent_id == id }
                # Если объект найден, выделяем его
                # Проверка типа инструмента
                if tool.is_a?(KazDev::Cutting_Kazdev::Cutting_Tool)
                    puts "Active tool is a Cutting_Tool"
                    $wd.execute_script("setSelected(#{id})")
                else
                    puts "Active tool is not a Cutting_Tool"
                    selection.add(entity0) if entity0
                    selection.add(entity1) if entity1
                end
                
            end
        end
    end
end

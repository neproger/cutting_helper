require_relative 'cutting_kazdev/KazDev_lib2'

module KazDev
	module Cutting_Kazdev
        include KazDev::KazDev_lib2
        extend self
        require 'json'

        def load_settings()
            plugins_directory = File.dirname(__FILE__)

            # Путь к папке cutting_kazdev относительно текущей директории
            @cutting_directory = File.join(plugins_directory, 'cutting_kazdev')
            file_path = File.join(@cutting_directory, 'sketchup_settings.json')

            if File.exist?(file_path)
                settings_data = File.read(file_path)
                JSON.parse(settings_data)
            else
                { "userSettings" => {} }
            end
        end

        def save_settings(settings)
            plugin_directory = File.dirname(__FILE__)
            target_directory = File.join(plugin_directory, 'cutting_kazdev')
            file_path = File.join(target_directory, 'sketchup_settings.json')
            File.open(file_path, 'w') do |file|
              file.write(settings.to_json)
            end
        end

        def set_user_settings(new_user_settings)
            settings = load_settings  # Загружаем существующие настройки

            # Объединяем существующие пользовательские настройки с новыми
            settings['userSettings'] = settings['userSettings'].merge(new_user_settings)

            save_settings(settings)  # Сохраняем обновленные настройки
        end

        def update_material(material)
            settings = load_settings()  # Загружаем существующие настройки
          
            # Находим материал по коду
            material_index = settings['materials'].find_index { |mat| mat['code'] == material['code'] }
          
            if material_index.nil?
              raise "Material with code #{material['code']} not found."
            end
          
            # Обновляем данные материала
            settings['materials'][material_index] = material

            save_settings(settings)  # Сохраняем обновленные настройки
            settings = load_settings()
            $wd.execute_script("stateAction({
                action: 'set_settings',
                data: #{settings.to_json},
            })")
        end

        def delete_material(code)
            settings = load_settings  # Загружаем существующие настройки
            
            # Убедимся, что 'materials' существует
            settings['materials'] ||= []
          
            # Найдем индекс материала по коду
            material_index = settings['materials'].find_index { |mat| mat['code'] == code }
            
            if material_index.nil?
                raise "Material with code #{code} not found."  # Ошибка, если материал не найден
            end
            
            # Удаляем материал из списка
            settings['materials'].delete_at(material_index)
          
            # Сохраняем обновленные настройки
            save_settings(settings)
          
            # Обновляем интерфейс
            $wd.execute_script("stateAction({
              action: 'set_settings',
              data: #{settings.to_json},
            })")
        end

        def add_material(new_material)
            settings = load_settings  # Загружаем существующие настройки
            
            # Убедимся, что 'materials' существует и создаем его, если отсутствует
            settings['materials'] ||= []
          
            # Проверяем, существует ли материал с таким же кодом
            existing_material = settings['materials'].find { |mat| mat['code'] == new_material['code'] }
            
            if existing_material
                # Материал с таким кодом уже существует, можно бросить исключение или вернуть сообщение
                raise "Material with code #{new_material['code']} already exists."
            else
                # Добавляем новый материал, если его еще нет
                settings['materials'].push(new_material)
            end
            
            save_settings(settings)  # Сохраняем обновленные настройки
            settings = load_settings()
            $wd.execute_script("stateAction({
                action: 'set_settings',
                data: #{settings.to_json},
            })")
        end

        class SelectionSpy <  Sketchup::SelectionObserver
            include KazDev::KazDev_lib2

            def onSelectionBulkChange(selection)
                model = Sketchup.active_model
                entities = model.entities

                sel_ids = []
                ents = []
                selection.each do |entity|
                    id = entity.persistent_id
                    sel_ids.push(id.to_i)

                    part_id = entity.get_attribute("KazDev", "part_id")
                    if part_id
                        sel_ids.push(part_id.to_i)
                        entity1 = entities.find { |e| e.persistent_id == part_id.to_i }
                        ents.push(entity1) if entity1
                    end

                    entity0 = entities.find { |e| e.get_attribute("KazDev", "part_id").to_i == id }
                    ents.push(entity0) if entity0
                end

                if ents
                    ents.each do |entity|
                        selection.add(entity)
                    end
                end
                $wd.execute_script("setSelected(#{sel_ids})") if sel_ids
            end
            
            def onSelectionCleared(selection)
                $wd.execute_script("setSelected([])")
            end
        end

        def show()
            return if $wd && $wd.visible?
            observer = SelectionSpy.new
            selection = Sketchup.active_model.selection
            selection.add_observer(observer)
            $wd = UI::HtmlDialog.new(
            {
                :dialog_title => "Cutting",
                :preferences_key => "com.kaz_dev",
                :scrollable => true,
                :resizable => true,
                :left => 0,
                :top => 0,
                :style => UI::HtmlDialog::STYLE_DIALOG
            })
            
            html_file = File.join(__dir__, 'cutting_kazdev/app2/build', 'index.html')
            $wd.set_file(html_file)
            $wd.show
            $wd.set_size(700, 800)
            $wd.set_on_closed { selection.remove_observer(observer) }

            $wd.add_action_callback("set_settings") { |d, settings |
                settings.each do |key, value|
                    puts "Ключ: #{key}, Значение: #{value}"
                end
                set_user_settings(settings)
                settings = load_settings()
                $wd.execute_script("stateAction({
                    action: 'set_settings',
                    data: #{settings.to_json},
                })")
            }

            $wd.add_action_callback("save_material") { |d, material |
                material.each do |key, value|
                    puts "Ключ: #{key}, Значение: #{value}"
                end
                update_material(material)
            }

            $wd.add_action_callback("add_material") { |d, material |
                material.each do |key, value|
                    puts "Ключ: #{key}, Значение: #{value}"
                end
                add_material(material)
            }

            $wd.add_action_callback("delete_material") { |d, code |
                delete_material(code)
            }

            $wd.add_action_callback("get_settings") {
                settings = load_settings()
                $wd.execute_script("stateAction({
                    action: 'set_settings',
                    data: #{settings.to_json},
                })")
            }

            $wd.add_action_callback("get_parts") {
                model = Sketchup.active_model
                selection = model.selection
                model.start_operation("Get Parts", true) # Начало операции
            
                begin
                    data = []
                    selection.each do |entity|
                        if entity.is_a?(Sketchup::Group) || entity.is_a?(Sketchup::ComponentInstance)
                            result = createDataObj(entity)
                            data << result
                        end
                    end
                    $wd.execute_script("stateAction({
                        action: 'set_parts',
                        data: #{data.to_json},
                    })")
                ensure
                    model.commit_operation # Завершение операции
                end
            }       

            $wd.add_action_callback("get_layers") {
                layers_info = get_layers()
                $wd.execute_script("stateAction({
                    action: 'set_layers',
                    data: #{layers_info.to_json},
                })")
            }

            $wd.add_action_callback("post_block_bitmap") { |d, png, id, w, h|
                puts [id, w, h]
                if png.is_a?(String)
                    puts "Переменная png является строкой."
                else
                    puts "Переменная png не является строкой."
                    return
                end
                image_data = png.split(",")[1]
                path = File.join(Dir.tmpdir, id.to_s + ".png")
                File.open(path, 'wb') do |f|
                    f.write(Base64.decode64(image_data))
                end

                model = Sketchup.active_model
                entities = model.active_entities
                material = nil    
                if path
                    materials = model.materials
                    material = materials[id.to_s]
                    if material.nil?
                        material = materials.add(id.to_s)
                        puts "Материал '#{id.to_s}' создан."
                    else
                        puts "Материал '#{id.to_s}' уже существует. Текстура будет заменена."
                    end
                    material.texture = path
                    material.texture.size = [w, h]
                    puts "Текстура сохранена для материала '#{id.to_s}'."
                else
                    puts "Ошибка при создании материала '#{id}'."
                    return nil
                end

                found_entity = find_entity_by_persistent_id(model, id)
                if found_entity.is_a?(Sketchup::ComponentInstance)
                    ents = found_entity.definition.entities
                else
                    ents = found_entity.entities
                end

                with_vertices = ents.select { |entity| entity.respond_to?(:vertices) }
                vertices = with_vertices.flat_map(&:vertices).uniq

                vertices = with_vertices.flat_map(&:vertices).uniq


                if found_entity
                    return unless found_entity.is_a?(Sketchup::Group) || found_entity.is_a?(Sketchup::ComponentInstance)

                    group1faces = found_entity.entities.grep(Sketchup::Face)
                    group1faces.each do |face|
                        face_bounds = 
                        puts "group1faces '#{face}' найдена."
                    end

                    topId = found_entity.get_attribute("KazDev", "top")
                    frontId = found_entity.get_attribute("KazDev", "face")
                    frontFace = find_entity_by_persistent_id(found_entity, frontId)
                    if frontFace
                        frontFace.material = material
                    else
                        puts "Верхняя грань объекта с persistent_id '#{id}' не найдена."
                    end
                else
                    puts "Объект с persistent_id '#{id}' не найден."
                    return nil
                end

                # Инициализируем переменные для хранения максимальных координат
                max_x = -Float::INFINITY
                min_y = Float::INFINITY
                min_z = Float::INFINITY
                max_vertex = nil

                max_ver = vertices[0]

                # Проходим по всем вершинам и ищем максимальные координаты
                vertices.each do |vertex|
                    x = vertex.position.x
                    y = -vertex.position.y # Инвертируем координату y
                    z = -vertex.position.z # Инвертируем координату z

                    # Сравниваем с текущими максимальными значениями
                    if x > max_x && y < min_y && z < min_z
                        max_x = x
                        min_y = y
                        min_z = z
                        max_vertex = vertex
                    end

                    if vertex.position.x > max_ver.position.x ||
                        (vertex.position.x == max_ver.position.x && vertex.position.y < max_ver.position.y) ||
                        (vertex.position.x == max_ver.position.x && vertex.position.y == max_ver.position.y && vertex.position.z < max_ver.position.z)
                        max_ver = vertex
                    end
                end

                vertex = max_ver 

                # Инвертируем значения координат вершины
                position = Geom::Point3d.new(vertex.position.x, vertex.position.y, vertex.position.z)
                inverted_position = Geom::Point3d.new(-vertex.position.x, -vertex.position.y, -vertex.position.z)
                transformation = Geom::Transformation.new(inverted_position)
                transformation2 = Geom::Transformation.new(position)
                entities.transform_entities(transformation, with_vertices)
                found_entity.definition.instances.each do |instance|
                    entities.transform_entities(transformation2, instance)
                end
                
                
                
                puts "with_vertices '#{vertices[0].position}' установлен для верхней грани объекта с persistent_id '#{id}'."
                ##

            }

            $wd.add_action_callback("get_file_info") { |d|
                file_info = get_file_info()
                $wd.execute_script("stateAction({
                    action: 'set_file_info',
                    data: #{file_info.to_json},
                })")
            }

            $wd.add_action_callback("set_data") { |d, type, id, name, param|
                if param == "true"
                    param = true
                elsif param == "false"
                    param = false
                end
                id = id.to_i
                set_data(type, id, name, param)
            }

            $wd.add_action_callback("set_data_array") do |d, array|
                set_data_array(array)
            end            

            $wd.add_action_callback("select_entity") { |d, id|
                # puts id
                # id = id.to_i
                select_entity(id)
                $wd.execute_script("setSelected(#{id})")
            }

            $wd.add_action_callback("draw_map") do |d, a|
                begin
                    array = JSON.parse(a)
                    raise "Не массив" unless array.is_a?(Array)
                    raise "Пустой массив" if array.empty?
            
                    model = Sketchup.active_model
                    model.start_operation("Draw Map", true)
            
                    xOffset = 0
                    offset = 200
                    
                    array.each do |material|
                        next unless material.is_a?(Hash) && material['result'].is_a?(Array)

                        # Рисуем сам материал
                        material_group = draw_rectangle(0, xOffset, material['width'], material['height'], nil, false)
                        # Рисуем части внутри материала
                        material['result'].each do |obj|
                            type = obj["type"]
                            if type == "parts" 
                                # Проверяем наличие left_thick_grinding и добавляем его половину
                                left_thick_grinding = obj["left_thick_grinding"].to_f
                                top_thick_grinding = obj["top_thick_grinding"].to_f

                                x = obj["x"].to_f + left_thick_grinding / 2
                                y = obj["y"].to_f + xOffset + top_thick_grinding / 2
                                width = obj["width"].to_f
                                height = obj["height"].to_f
                                part_id = obj["id"].to_i
                                rotated = obj["rotation"]
                                if obj["left_thick_grinding"].to_f > 0 || obj["top_thick_grinding"].to_f > 0
                                    # Нарисовать прямоугольник для левого и верхнего отступа
                                    grinding = draw_rectangle(obj["x"].to_f, obj["y"].to_f + xOffset, width, height, nil, false)
                                    puts "Рисую отступ ID: #{part_id} с координатами (#{x}, #{y}), размером #{width}x#{height}"
                                end
                                # Фильтрация объектов с шириной или высотой меньше одного
                                if width >= 1 && height >= 1
                                    part_group = draw_rectangle(x, y, width, height, part_id, rotated)
                                    puts "Рисую часть ID: #{part_id} с координатами (#{x}, #{y}), размером #{width}x#{height}"
                                else
                                    puts "Пропущена часть ID: #{part_id} из-за некорректных размеров (#{width}x#{height})"
                                end
                            end
                        end
            
                        # Обновляем смещение для следующего материала
                        xOffset += material['height'].to_f + offset
                    end
            
                    model.commit_operation
                rescue JSON::ParserError => e
                    UI.messagebox("Ошибка парсинга JSON: #{e.message}")
                    model.abort_operation
                rescue Exception => e
                    UI.messagebox("Ошибка: #{e.message}")
                    model.abort_operation
                end
            end
        end

		### Методы обратного вызова AppObserver:
		def expectsStartupModelNotifications
			return true
		end
	
		def onNewModel(model)
			attach_model_spies(model)
		end
	
		def onOpenModel(model)
			attach_model_spies(model)
		end

        unless defined?(@loaded)
            # Добавляем элемент меню для вызова нашего инструмента
            UI.menu('Extensions').add_item('Cutting tools') {
                Sketchup.active_model.tools.push_tool(KazDev::Cutting_Kazdev::Cutting_Tool.new)
            }
            UI.menu('Extensions').add_item('Cutting') {show()}
            @loaded = true
        end
	end
end

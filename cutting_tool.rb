# cutting_tool.rb 22

module KazDev
    module Cutting_Kazdev
        class Cutting_Tool 
            include KazDev::KazDev_lib2
            def initialize
                plugins_directory = File.dirname(__FILE__)
                cutting_directory = File.join(plugins_directory, 'cutting_kazdev')
                @cursor_path = File.join(cutting_directory, "icons/cutting_tools_cursor_32x32.svg")
                @cursor_id = nil
                @side_points = {}
                if File.exist?(@cursor_path)
                    @cursor_id = UI.create_cursor(@cursor_path, 16, 16) # 16, 16 — это координаты точки "нажатия" курсора
                else
                    puts "Файл курсора не найден: #{@cursor_path}"
                end
            end
            def onSetCursor
                UI.set_cursor(@cursor_id)
            end
            
            def activate
                if @cursor_id
                    UI.set_cursor(@cursor_id)
                    puts "Инструмент активирован"
                else
                    puts "Курсор не установлен"
                end
                Sketchup.send_action("cutting_tool")
            end

            def onLButtonDown(flags, x, y, view)
                input_point = Sketchup::InputPoint.new
                input_point.pick(view, x, y)

                if input_point.valid?
                if handle_polygon_click(x, y)
                    view.invalidate
                    return
                end
                entity = input_point.instance_path.root
                handle_entity_selection(entity)
                else
                    puts "Точка некорректна"
                end
            end
            
            # Проверяем, был ли клик внутри полигона, и обновляем параметры
            def handle_polygon_click(x, y)
                @side_points.each do |side, points|
                    if point_within_polygon([x, y], points)
                        toggle_polygon_param(side)
                        return true
                    end
                end
                false
            end
            
            # Изменяем параметр на противоположное значение и сохраняем его
            def toggle_polygon_param(side)
                param_key = "#{side}_name"
                puts "Clicked on #{side} param_key: #{@data_obj[param_key]}"
                @data_obj[param_key] = !@data_obj[param_key]
                set_data("parts", @data_obj[:id], param_key, @data_obj[param_key])
            end
            
            # Обрабатываем выбор объекта, получаем его данные и атрибуты
            def handle_entity_selection(entity)
                @root_entity = entity
                if @root_entity.is_a?(Sketchup::Group) || @root_entity.is_a?(Sketchup::ComponentInstance)
                @data_obj = createDataObj(@root_entity)
                # select_entity([@data_obj[:id]])
                if @data_obj
                    display_data(@data_obj)
                    $wd.execute_script("setSelected(#{[@data_obj[:id]]})") if $wd
                else
                    puts "Атрибуты KazDev не найдены"
                end
                else
                    puts "Группа или компонент не найдены"
                end
                
            end
            
            # Отображение данных объекта
            def display_data(data_obj)
                data_str = data_obj.map { |key, value| "#{key}: #{value}" }.join(", ")
                @kaz_dev_data = data_obj[:label]
            end
            
            def point_within_polygon(point, polygon_points)
                # puts "point #{point}"
                # puts "polygon_points #{polygon_points}"
                # Преобразуем 3D точки в 2D для проверки
                points_2d = polygon_points.map { |p| [p.x, p.y] }
            
                # Реализуем алгоритм для проверки, находится ли точка внутри полигона
                inside = false
                j = points_2d.length - 1
            
                points_2d.each_with_index do |p, i|
                    if ((p[1] > point[1]) != (points_2d[j][1] > point[1])) &&
                       (point[0] < (points_2d[j][0] - p[0]) * (point[1] - p[1]) / (points_2d[j][1] - p[1]) + p[0])
                        inside = !inside
                    end
                    j = i
                end
            
                inside
            end
            

            def onMouseMove(flags, x, y, view)
            end

            def onLButtonUp(flags, x, y, view)
                # Обработка события нажатия кнопки мыши
            end

            def get_entities(entity)
                if entity.is_a?(Sketchup::Group)
                    # Если это группа, возвращаем её сущности
                    return entity.entities
                elsif entity.is_a?(Sketchup::ComponentInstance)
                    # Если это компонент, возвращаем его сущности
                    return entity.definition.entities
                else
                    # Если объект не является группой или компонентом, возвращаем nil
                    return nil
                end
            end
            
            
            def draw(view)
                color_bg1 = Sketchup::Color.new(150, 150, 150, 128)
                if @data_obj && @root_entity
                    # Преобразуем размеры из миллиметров в дюймы
                    width = @data_obj[:width].to_f / 25.4   # Ширина в дюймах
                    height = @data_obj[:height].to_f / 25.4 # Высота в дюймах
                    depth = @data_obj[:depth].to_f / 25.4   # Глубина в дюймах
                    faces = @data_obj[:faces]  # Точки осей
                    [:top, :bottom, :left, :right].each do |side|
                        
                        color = @data_obj["#{side}_name"] ? 'Green' : color_bg1
                        
                        draw_side(view, faces[side], color, side)
                    end
                    
                end
                
                options = {
                    :color => "Red",
                    :font => "Arial",
                    :size => 20,
                    :bold => true,
                    :align => TextAlignLeft
                }
                if @kaz_dev_data
                    text_position = Geom::Point3d.new(10, 10, 0) # Позиция текста на экране
                    view.draw_text(text_position, @kaz_dev_data, options)
                end
            end

            def project_3d_to_2d(view, points_3d)
                points_2d = points_3d.map do |point|
                    view.screen_coords(point)
                end
                points_2d
            end
            
            def calculate_polygon_center(points)
                x_sum = 0
                y_sum = 0
                z_sum = 0
                count = points.length
            
                points.each do |point|
                    x_sum += point.x
                    y_sum += point.y
                    z_sum += point.z
                end
            
                center_x = x_sum / count
                center_y = y_sum / count
                center_z = z_sum / count
            
                Geom::Point3d.new(center_x, center_y, center_z)
            end

            def draw_side(view, points, color, side)
                points = points.map { |p| p.is_a?(Geom::Point3d) ? p : Geom::Point3d.new(p) }
                view.drawing_color = color
                points_2d = project_3d_to_2d(view, points)
                @side_points[side] = points_2d
                view.draw2d(GL_POLYGON, points_2d)
                view.drawing_color = 'Blue'
                view.draw(GL_LINE_STRIP, points)
            end

            def deactivate(view)
                puts "Инструмент деактивирован"
            end
        end
    end
end

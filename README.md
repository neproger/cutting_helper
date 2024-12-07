# Плагин cutting_helper для SketchUp.

## Описание
Этот плагин добавляет инструменты для создания спецификаций деталей и их раскроя в SketchUp.
**Плагин находится на этапе разработки!!!** За возможные ошибки и не предвиденное поведение автор ответсвенности не несет!.

## Функции
- **Список**: В этом разделе можно добавить дополнительные атрибуты к деталям, такие как: кромка, возможность поворота детали, описание и указание материала.
- **Крой**: Вкладка отображает список используемых материалов. При нажатии на кнопку Крой генерируется карта раскроя.
- **Материалы**: Здесь можно редактировать список материалов, которые вы используете.
- **Отчет XML**: Экспортирует данные о деталях в файл XML, который можно использовать с программой [Cutting Optimisation Pro](https://www.optimalprograms.com/cutting-optimization/).
- **Настройки**: В разделе настроек можно указать используемый инструмент для резки. Также доступны параметры для смещения, обрезки листа, установки толщины материала и вычитания кромки. 

## Установка
1. Скачайте плагин zip архивом.
2. Разархивируйте файлы в каталог плагинов SketchUp.
3. Перезапустите SketchUp.
4. Плагин будет доступен через меню SketchUp.

## Использование
1. Выберите детали, которые планируете добавить в список кроя, и выберите пункт Cutting в меню плагинов SketchUp.
2. Список деталей будет разделен по слоям. Каждый слой будет представлен как отдельный список. Это позволит отделить фасады от корпусных деталей, например. Для каждой группы можно выбрать свой материал и перейти на вкладку **Крой**.
3. В списке материалов под каждым из них будет кнопка **Крой**.
4. Далее можно вывести отчет в формате PDF и отрисовать результат раскроя в пространстве SketchUp, чтобы экспортировать модель для ЧПУ-обработки, к примеру.

## Видео
Для лучшего понимания работы плагина посмотрите видеоурок [на YouTube](https://www.youtube.com/watch?v=RM_MeVCtCq8)

## Контакты
- **Авторы**: Neproger, Vladimir Syroezhkin
- **Контакты**: kazmazdev@gmail.com

## Лицензия
Этот проект распространяется под лицензией MIT. Подробнее см. в файле LICENSE.

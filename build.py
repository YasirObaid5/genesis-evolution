import pathlib
root = pathlib.Path(__file__).parent
src = root / 'src'
tpl = (src / 'template.html').read_text()
frag = (tpl.replace('<!--@@ORIGINS_HTML@@-->', (src / 'origins.html').read_text())
           .replace('<!--@@COLUMN_HTML@@-->', (src / 'column.html').read_text())
           .replace('<!--@@OBS_HTML@@-->', (src / 'obs.html').read_text())
           .replace('/*@@BUI@@*/', (src / 'obs-ui.js').read_text())
           .replace('/*@@COLUMN@@*/', (src / 'column.js').read_text())
           .replace('/*@@CUI@@*/', (src / 'column-ui.js').read_text())
           .replace('/*@@WORLDS@@*/', (src / 'worlds.js').read_text())
           .replace('/*@@CORE@@*/', (src / 'core.js').read_text())
           .replace('/*@@UI@@*/', (src / 'ui.js').read_text())
           .replace('/*@@ORIGINS@@*/', (src / 'origins.js').read_text())
           .replace('/*@@OUI@@*/', (src / 'origins-ui.js').read_text()))
(root / 'dist').mkdir(exist_ok=True)
(root / 'dist/artifact.html').write_text(frag)
full = ('<!doctype html>\n<html lang="ar" dir="rtl">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n'
        + frag + '\n</body>\n</html>\n')
(root / 'dist/index.html').write_text(full)
(root / 'index.html').write_text(full)
print(len(full))

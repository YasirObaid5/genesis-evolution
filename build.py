import pathlib
root = pathlib.Path(__file__).parent
src = root / 'src'
tpl = (src / 'template.html').read_text(encoding='utf-8')
frag = (tpl.replace('<!--@@ORIGINS_HTML@@-->', (src / 'origins.html').read_text(encoding='utf-8'))
           .replace('<!--@@COLUMN_HTML@@-->', (src / 'column.html').read_text(encoding='utf-8'))
           .replace('<!--@@OBS_HTML@@-->', (src / 'obs.html').read_text(encoding='utf-8'))
           .replace('/*@@BUI@@*/', (src / 'obs-ui.js').read_text(encoding='utf-8'))
           .replace('/*@@COLUMN@@*/', (src / 'column.js').read_text(encoding='utf-8'))
           .replace('/*@@CUI@@*/', (src / 'column-ui.js').read_text(encoding='utf-8'))
           .replace('/*@@WORLDS@@*/', (src / 'worlds.js').read_text(encoding='utf-8'))
           .replace('/*@@CORE@@*/', (src / 'core.js').read_text(encoding='utf-8'))
           .replace('/*@@UI@@*/', (src / 'ui.js').read_text(encoding='utf-8'))
           .replace('/*@@ORIGINS@@*/', (src / 'origins.js').read_text(encoding='utf-8'))
           .replace('/*@@OUI@@*/', (src / 'origins-ui.js').read_text(encoding='utf-8'))
           .replace('<!--@@EXPERIMENT_HTML@@-->', (src / 'experiments.html').read_text(encoding='utf-8'))
           .replace('/*@@EXPERIMENT_CSS@@*/', (src / 'experiments.css').read_text(encoding='utf-8'))
           .replace('/*@@EXPERIMENTS@@*/', (src / 'experiments.js').read_text(encoding='utf-8'))
           .replace('/*@@EXPERIMENT_WORKER@@*/', (src / 'experiments-worker.js').read_text(encoding='utf-8'))
           .replace('/*@@EXPERIMENT_UI@@*/', (src / 'experiments-ui.js').read_text(encoding='utf-8')))
(root / 'dist').mkdir(exist_ok=True)
(root / 'dist/artifact.html').write_text(frag, encoding='utf-8')
full = ('<!doctype html>\n<html lang="ar" dir="rtl">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n'
        + frag + '\n</body>\n</html>\n')
(root / 'dist/index.html').write_text(full, encoding='utf-8')
(root / 'index.html').write_text(full, encoding='utf-8')
print(len(full))

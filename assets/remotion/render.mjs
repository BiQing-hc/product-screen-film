import {execFileSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, renameSync, rmSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const project = fileURLToPath(new URL('.', import.meta.url));
const output = path.join(project, 'out');
mkdirSync(output, {recursive:true});
const work = mkdtempSync(path.join(output, '.render-'));
const raw = path.join(work, 'studio.mp4');
const final = path.join(work, 'product-film.mp4');
try {
  const cli = path.join(project, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');
  execFileSync(process.execPath, [cli, 'render', 'index.ts', 'ProductFilm', raw, '--codec=h264',
    '--audio-codec=aac', '--audio-bitrate=320k', '--enforce-audio-track', ...process.argv.slice(2)],
    {cwd:project, stdio:'inherit'});
  // AAC encoding may leave a short tail beyond the last picture. Follow the rendered video
  // duration, including revisions made with --props, and preserve all encoded video frames.
  const duration = execFileSync('ffprobe', ['-v','error','-select_streams','v:0','-show_entries',
    'stream=duration','-of','default=nw=1:nk=1',raw], {encoding:'utf8'}).trim();
  if (!Number.isFinite(Number(duration)) || Number(duration) <= 0) throw new Error('无法读取画面时长');
  execFileSync('ffmpeg', ['-hide_banner','-loglevel','error','-nostdin','-i',raw,'-map','0:v:0',
    '-map','0:a:0','-c:v','copy','-af','apad','-c:a','aac','-b:a','256k','-t',duration,
    '-movflags','+faststart',final], {stdio:'inherit'});
  const dest = path.join(output, 'product-film.mp4');
  renameSync(final, dest);
  console.log(dest);
} finally {
  rmSync(work, {recursive:true, force:true});
}

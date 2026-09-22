import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
fs.mkdirSync('out',{recursive:true});
// Normalize an SVG coordinate separator before bundling. Packaged source includes this correction.
const sourcePath='src/index.tsx';
const source=fs.readFileSync(sourcePath,'utf8');
fs.writeFileSync(sourcePath,source.replace('${13+open*13}28Q31','${13+open*13} 28Q31'));
const serveUrl=await bundle({entryPoint:path.resolve(sourcePath)});
const composition=await selectComposition({serveUrl,id:'BotanicalMotionStudy'});
for(const frame of [180,390,645,840,1080]){
  await renderStill({serveUrl,composition,frame,output:`out/review-${frame}.png`,scale:.5});
}
let last=-1;
await renderMedia({serveUrl,composition,codec:'h264',audioCodec:'aac',audioBitrate:'320k',pixelFormat:'yuv420p',crf:18,x264Preset:'veryfast',concurrency:2,imageFormat:'jpeg',jpegQuality:96,outputLocation:'out/Botanical_Motion_Study_4K60.mp4',timeoutInMilliseconds:180000,onProgress:({renderedFrames,encodedFrames,progress})=>{const pct=Math.floor(progress*100);if(pct!==last && pct%5===0){last=pct;console.log(JSON.stringify({pct,renderedFrames,encodedFrames}));}}});
fs.writeFileSync('out/render-report.json',JSON.stringify({renderer:'Native @remotion/renderer',version:'4.0.526',width:composition.width,height:composition.height,fps:composition.fps,frames:composition.durationInFrames,narration:false,referenceMatchVerified:false,status:'Original animation/sound study, NOT the full narrated edit'},null,2));

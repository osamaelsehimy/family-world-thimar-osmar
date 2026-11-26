import React, { useRef } from 'react';
import { Clapperboard, Sparkles, Play, Film } from 'lucide-react';

const copy={
 ar:{eyebrow:'FAMILY WORLD · ENTERTAINMENT',title:'ثيمي والبوت',subtitle:'مسلسل ثيمي والبوت',description:'رحلة ممتعة تجمع ثيمي ورفيقه الآلي في عالم الأسرة، والتعلّم، والتعاون، والاكتشاف.',status:'ابدأ الاستكشاف',poster:'الصورة الرسمية لعالم الأسرة',credit:'Family World · Developed by OSMAR Ecosystems',episodesTitle:'أول فيديوهين في اللعبة',episodesIntro:'ابدأ من هنا، وشاهد الفيديوهين التعريفيين قبل استكشاف بقية عوالم Family World.',episodeOne:'الفيديو الأول · بداية الاستكشاف',episodeTwo:'الفيديو الثاني · نكمل الرحلة',videoLabel:'مشغل الفيديو'},
 en:{eyebrow:'FAMILY WORLD · ENTERTAINMENT',title:'Thimmy & The Bot',subtitle:'The Thimmy & The Bot series',description:'A fun journey with Thimmy and his robot companion through family life, learning, teamwork and discovery.',status:'Start exploring',poster:'Official Family World artwork',credit:'Family World · Developed by OSMAR Ecosystems',episodesTitle:'The first two videos in the game',episodesIntro:'Start here with these two introductory videos before exploring the rest of Family World.',episodeOne:'Video 1 · Start Exploring',episodeTwo:'Video 2 · Continue the Journey',videoLabel:'Video player'},
 zh:{eyebrow:'FAMILY WORLD · 娱乐',title:'Thimmy 与机器人',subtitle:'Thimmy 与机器人的系列故事',description:'与 Thimmy 和他的机器人伙伴一起，在家庭生活、学习、合作与探索中展开有趣旅程。',status:'开始探索',poster:'Family World 官方主题图',credit:'Family World · Developed by OSMAR Ecosystems',episodesTitle:'游戏中的前两个视频',episodesIntro:'从这两个介绍视频开始，然后探索 Family World 的其他世界。',episodeOne:'视频 1 · 开始探索',episodeTwo:'视频 2 · 继续旅程',videoLabel:'视频播放器'}
};
export default function EntertainmentHub({lang='ar'}){
 const t=copy[lang]||copy.ar;
 const root=`${import.meta.env.BASE_URL}assets/brand/`;
 const videos=useRef([]);
 return <main className="entertainment-hub" dir={lang==='ar'?'rtl':'ltr'}>
  <header className="entertainment-heading"><span><Clapperboard size={15}/>{t.eyebrow}</span><h1>{t.title}</h1><p>{t.subtitle}</p><small>{t.description}</small></header>
  <article className="entertainment-poster">
   <img src={`${root}family-world-series-poster.png`} alt={t.poster}/>
   <div className="entertainment-poster-caption"><Sparkles size={16}/><strong>{t.status}</strong><span>{t.credit}</span></div>
  </article>
  <section className="entertainment-episodes" aria-labelledby="entertainment-episodes-title">
   <div className="entertainment-episodes-heading"><span><Film size={16}/>{t.eyebrow}</span><h2 id="entertainment-episodes-title">{t.episodesTitle}</h2><p>{t.episodesIntro}</p></div>
   <div className="entertainment-episode-grid">
    {[{title:t.episodeOne,src:'fw-series-episode-01.mp4'},{title:t.episodeTwo,src:'fw-series-episode-02.mp4'}].map((episode,index)=><article className="entertainment-episode" key={episode.src}>
     <div className="entertainment-episode-title"><span><Play size={14} fill="currentColor"/></span><h3><small>{String(index+1).padStart(2,'0')}</small>{episode.title}</h3></div>
     <video ref={element=>{videos.current[index]=element;}} controls playsInline preload="metadata" poster={`${root}family-world-series-poster.png`} aria-label={`${t.videoLabel}: ${episode.title}`} onPlay={event=>videos.current.forEach(video=>{if(video&&video!==event.currentTarget)video.pause();})}>
      <source src={`${root}${episode.src}`} type="video/mp4" />
     </video>
    </article>)}
   </div>
  </section>
 </main>;
}

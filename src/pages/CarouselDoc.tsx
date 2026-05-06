import React, { useRef } from 'react';
import { Carousel, type CarouselRef, Button } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const SLIDE_BG = ['#5b8def', '#a855f7', '#22d3ee', '#10b981', '#f59e0b'];

const Slide: React.FC<{ idx: number; text: React.ReactNode }> = ({ idx, text }) => (
  <div
    style={{
      width: '100%',
      height: 240,
      background: `linear-gradient(135deg, ${SLIDE_BG[idx % SLIDE_BG.length]}, ${SLIDE_BG[(idx + 2) % SLIDE_BG.length]})`,
      color: '#fff',
      fontSize: 32,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      letterSpacing: '0.04em',
    }}
  >
    {text}
  </div>
);

const CarouselDoc: React.FC = () => {
  return (
    <>
      <h1>Carousel 轮播图</h1>
      <p>
        子节点 = 幻灯片。支持自动播放、左右箭头、底部指示点、键盘 ←/→ 切换、
        触摸 swipe、loop 循环、slide / fade 两种切换效果,以及 ref 命令式 API。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法 (autoplay + 指示点 + loop)"
        description="子节点直接当 slide 用,3 秒自动切, 鼠标悬停暂停。"
        code={`<Carousel autoplay={3000} loop>
  <div>Slide 1</div>
  <div>Slide 2</div>
  <div>Slide 3</div>
</Carousel>`}
      >
        <Carousel autoplay={3000} loop style={{ width: '100%' }}>
          <Slide idx={0} text="Slide 1" />
          <Slide idx={1} text="Slide 2" />
          <Slide idx={2} text="Slide 3" />
          <Slide idx={3} text="Slide 4" />
        </Carousel>
      </DemoBlock>

      <DemoBlock
        title="带左右箭头"
        description="arrows 打开后, hover 时显示左右导航; 也支持键盘 ←/→ 切换 (容器 focus 时)。"
        code={`<Carousel arrows autoplay={4000}>...</Carousel>`}
      >
        <Carousel arrows autoplay={4000} style={{ width: '100%' }}>
          <Slide idx={0} text="A" />
          <Slide idx={1} text="B" />
          <Slide idx={2} text="C" />
        </Carousel>
      </DemoBlock>

      <DemoBlock
        title="fade 切换"
        description="effect='fade' — 适合纯图片或全屏 hero, 比横滑更柔和。"
        code={`<Carousel effect="fade" autoplay={2500} arrows>...</Carousel>`}
      >
        <Carousel effect="fade" autoplay={2500} arrows height={240} style={{ width: '100%' }}>
          <Slide idx={0} text="Fade 1" />
          <Slide idx={1} text="Fade 2" />
          <Slide idx={2} text="Fade 3" />
        </Carousel>
      </DemoBlock>

      <DemoBlock
        title="不循环 + 关闭自动播放"
        description="loop={false} 走到尽头不会回头; 不传 autoplay = 全手动。"
        code={`<Carousel loop={false} arrows>...</Carousel>`}
      >
        <Carousel loop={false} arrows style={{ width: '100%' }}>
          <Slide idx={0} text="第一张" />
          <Slide idx={1} text="中间" />
          <Slide idx={2} text="最后一张" />
        </Carousel>
      </DemoBlock>

      <DemoBlock
        title="一屏 3 张 (slidesPerView)"
        description="slidesPerView={3} 把可视区均分给 3 张, 配 gap 控制间距."
        code={`<Carousel slidesPerView={3} gap={16} arrows loop>
  {/* 6 张卡片 */}
</Carousel>`}
      >
        <Carousel slidesPerView={3} gap={16} arrows loop autoplay={3500} style={{ width: '100%' }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Slide key={i} idx={i} text={`Card ${i + 1}`} />
          ))}
        </Carousel>
      </DemoBlock>

      <DemoBlock
        title="居中模式 — 中间 1 张 + 左右各半张"
        description="centerMode + slidesPerView=1: active slide 居中, 左右各露出半张相邻 slide. 经典的'瀑布流卡片'布局."
        code={`<Carousel slidesPerView={1} centerMode gap={16} arrows>
  {/* 多张图片 / 卡片 */}
</Carousel>`}
      >
        <Carousel slidesPerView={1} centerMode gap={16} arrows autoplay={4000} loop style={{ width: '100%' }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Slide key={i} idx={i} text={`Center ${i + 1}`} />
          ))}
        </Carousel>
      </DemoBlock>

      <DemoBlock
        title="Coverflow — 中心 100% / 邻近 50% / 远端 20%·10%"
        description="peek={[1, 0.5, 0.2, 0.1]} — 数组 index 是距离中心的远近, 值是 scale. 中心 100%, 一邻 50%, 二邻 20%, 三邻 10%, 超出的不显示. 这是 Apple Cover Flow 风格."
        code={`<Carousel
  peek={[1, 0.5, 0.2, 0.1]}
  loop
  autoplay={3500}
  height={300}
>
  {/* 多张图 */}
</Carousel>`}
      >
        <Carousel
          peek={[1, 0.5, 0.2, 0.1]}
          loop
          autoplay={3500}
          height={300}
          style={{ width: '100%' }}
        >
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <Slide key={i} idx={i} text={`P ${i + 1}`} />
          ))}
        </Carousel>
      </DemoBlock>

      <DemoBlock
        title="Coverflow — 自定义缩放梯度 + 间距"
        description="slideWidth 控制中心宽度 (px), peekStep 调相邻间距. 数组多/少都行, 越长露出来的层级越多."
        code={`<Carousel
  peek={[1, 0.7, 0.45, 0.25]}
  slideWidth={320}
  peekStep={200}
  loop
  height={280}
>
  {...}
</Carousel>`}
      >
        <Carousel
          peek={[1, 0.7, 0.45, 0.25]}
          slideWidth={320}
          peekStep={200}
          loop
          height={280}
          arrows
          style={{ width: '100%' }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Slide key={i} idx={i} text={`${i + 1}`} />
          ))}
        </Carousel>
      </DemoBlock>

      <DemoBlock
        title="居中模式 + 一屏 3 张"
        description="slidesPerView=3 + centerMode: 中间 3 张全展示, 左右各露出半张邻近 slide. 跟 slick / swiper 的经典 carousel 视觉一致."
        code={`<Carousel slidesPerView={3} centerMode gap={12} arrows loop>
  {/* 8 张图 */}
</Carousel>`}
      >
        <Carousel slidesPerView={3} centerMode gap={12} arrows loop autoplay={3000} style={{ width: '100%' }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Slide key={i} idx={i} text={`${i + 1}`} />
          ))}
        </Carousel>
      </DemoBlock>

      <DemoBlock
        title="命令式控制 (ref API)"
        description="ref 拿到 { goTo, next, prev },从外部按钮 / 业务事件触发翻页。"
        code={`function Demo() {
  const ref = useRef<CarouselRef>(null);
  return (
    <>
      <Carousel ref={ref}>...</Carousel>
      <Button onClick={() => ref.current?.prev()}>上一张</Button>
      <Button onClick={() => ref.current?.next()}>下一张</Button>
      <Button onClick={() => ref.current?.goTo(2)}>跳到第 3 张</Button>
    </>
  );
}`}
      >
        <ImperativeDemo />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'children', desc: '幻灯片 (每个 ReactNode 一张)', type: 'ReactNode', default: '-' },
          { prop: 'current / defaultCurrent', desc: '受控 / 默认当前下标', type: 'number', default: '0' },
          { prop: 'effect', desc: '切换效果', type: `'slide' | 'fade'`, default: `'slide'` },
          { prop: 'autoplay', desc: '自动播放间隔 (ms; true=3000; 0 / false 关闭)', type: 'number | boolean', default: '0' },
          { prop: 'pauseOnHover', desc: '鼠标 hover 时暂停自动播放', type: 'boolean', default: 'true' },
          { prop: 'loop', desc: '循环 (走完最后一张回到第一张)', type: 'boolean', default: 'true' },
          { prop: 'arrows', desc: '显示左右箭头', type: 'boolean', default: 'false' },
          { prop: 'dots', desc: '显示底部指示点', type: 'boolean', default: 'true' },
          { prop: 'dotPosition', desc: '指示点位置', type: `'bottom' | 'top'`, default: `'bottom'` },
          { prop: 'height', desc: '高度 (fade 模式必传或最外层有高度)', type: 'number | string', default: '-' },
          { prop: 'duration', desc: '切换动画时长 ms', type: 'number', default: '400' },
          { prop: 'keyboard', desc: '容器 focus 时 ←/→ 切换', type: 'boolean', default: 'true' },
          { prop: 'draggable', desc: '触摸 / 鼠标拖拽切换', type: 'boolean', default: 'true' },
          { prop: 'swipeThreshold', desc: '拖动多少 px 触发翻页', type: 'number', default: '50' },
          { prop: 'slidesPerView', desc: '同时显示几张 (slide 模式), 1 = 单张, 3 = 一屏 3 张', type: 'number', default: '1' },
          { prop: 'centerMode', desc: 'active slide 居中, 左右两侧露出邻近 slide', type: 'boolean', default: 'false' },
          { prop: 'gap', desc: '幻灯片之间的间隔 px (slide 模式)', type: 'number', default: '0' },
          { prop: 'peek', desc: 'Coverflow 缩放数组 — index=距中心远近, 值=scale (0~1). 例 [1, 0.5, 0.2, 0.1]. 设置后 slidesPerView/centerMode/gap 被忽略', type: 'number[]', default: '-' },
          { prop: 'slideWidth', desc: 'peek 模式下中心 slide 的宽度 (px)', type: 'number', default: 'viewportW * 0.5' },
          { prop: 'peekStep', desc: 'peek 模式下相邻两张中心点的水平距离 (px)', type: 'number', default: 'slideWidth * 0.55' },
          { prop: 'onChange', desc: '切换时触发', type: '(index, prev) => void', default: '-' },
        ]}
      />

      <h2>CarouselRef (命令式)</h2>
      <ApiTable
        rows={[
          { prop: 'goTo', desc: '跳到指定下标 (按 loop 处理越界)', type: '(index: number) => void', default: '-' },
          { prop: 'next', desc: '下一张', type: '() => void', default: '-' },
          { prop: 'prev', desc: '上一张', type: '() => void', default: '-' },
        ]}
      />
    </>
  );
};

const ImperativeDemo: React.FC = () => {
  const ref = useRef<CarouselRef>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Carousel ref={ref} loop style={{ width: '100%' }}>
        <Slide idx={0} text="One" />
        <Slide idx={1} text="Two" />
        <Slide idx={2} text="Three" />
      </Carousel>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button onClick={() => ref.current?.prev()}>上一张</Button>
        <Button onClick={() => ref.current?.next()}>下一张</Button>
        <Button type="primary" onClick={() => ref.current?.goTo(2)}>跳到第 3 张</Button>
      </div>
    </div>
  );
};

export default CarouselDoc;

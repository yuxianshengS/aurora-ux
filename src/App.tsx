import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './site-components/Navbar';
import DocLayout from './layouts/DocLayout';
import Home from './pages/Home';

/* === 懒加载: 所有非首页路由都按需加载, 首屏只下 Home + Navbar === */
const GettingStarted = lazy(() => import('./pages/GettingStarted'));
const Design = lazy(() => import('./pages/Design'));
const ButtonDoc = lazy(() => import('./pages/ButtonDoc'));
const InputDoc = lazy(() => import('./pages/InputDoc'));
const CardDoc = lazy(() => import('./pages/CardDoc'));
const SwitchDoc = lazy(() => import('./pages/SwitchDoc'));
const ThemeSwitchDoc = lazy(() => import('./pages/ThemeSwitchDoc'));
const WalletDoc = lazy(() => import('./pages/WalletDoc'));
const TooltipDoc = lazy(() => import('./pages/TooltipDoc'));
const DatePickerDoc = lazy(() => import('./pages/DatePickerDoc'));
const TimelineDoc = lazy(() => import('./pages/TimelineDoc'));
const DayTimelineDoc = lazy(() => import('./pages/DayTimelineDoc'));
const Bar3DDoc = lazy(() => import('./pages/Bar3DDoc'));
const SplitDoc = lazy(() => import('./pages/SplitDoc'));
const TypewriterDoc = lazy(() => import('./pages/TypewriterDoc'));
const FlipDoc = lazy(() => import('./pages/FlipDoc'));
const PdfDownloadDoc = lazy(() => import('./pages/PdfDownloadDoc'));
const FullscreenProgressDoc = lazy(() => import('./pages/FullscreenProgressDoc'));
const TopProgressDoc = lazy(() => import('./pages/TopProgressDoc'));
const DraggableDoc = lazy(() => import('./pages/DraggableDoc'));
const SelectDoc = lazy(() => import('./pages/SelectDoc'));
const RadioDoc = lazy(() => import('./pages/RadioDoc'));
const CheckboxDoc = lazy(() => import('./pages/CheckboxDoc'));
const InputNumberDoc = lazy(() => import('./pages/InputNumberDoc'));
const SliderDoc = lazy(() => import('./pages/SliderDoc'));
const ModalDoc = lazy(() => import('./pages/ModalDoc'));
const DrawerDoc = lazy(() => import('./pages/DrawerDoc'));
const MessageDoc = lazy(() => import('./pages/MessageDoc'));
const NotificationDoc = lazy(() => import('./pages/NotificationDoc'));
const PopconfirmDoc = lazy(() => import('./pages/PopconfirmDoc'));
const AlertDoc = lazy(() => import('./pages/AlertDoc'));
const SpinDoc = lazy(() => import('./pages/SpinDoc'));
const TagDoc = lazy(() => import('./pages/TagDoc'));
const BadgeDoc = lazy(() => import('./pages/BadgeDoc'));
const AvatarDoc = lazy(() => import('./pages/AvatarDoc'));
const EmptyDoc = lazy(() => import('./pages/EmptyDoc'));
const DividerDoc = lazy(() => import('./pages/DividerDoc'));
const SpaceDoc = lazy(() => import('./pages/SpaceDoc'));
const PaginationDoc = lazy(() => import('./pages/PaginationDoc'));
const TabsDoc = lazy(() => import('./pages/TabsDoc'));
const TableDoc = lazy(() => import('./pages/TableDoc'));
const MenuDoc = lazy(() => import('./pages/MenuDoc'));
const DropdownDoc = lazy(() => import('./pages/DropdownDoc'));
const StepsDoc = lazy(() => import('./pages/StepsDoc'));
const BreadcrumbDoc = lazy(() => import('./pages/BreadcrumbDoc'));
const SparklineDoc = lazy(() => import('./pages/SparklineDoc'));
const KpiCardDoc = lazy(() => import('./pages/KpiCardDoc'));
const GaugeDoc = lazy(() => import('./pages/GaugeDoc'));
const FunnelDoc = lazy(() => import('./pages/FunnelDoc'));
const HeatmapDoc = lazy(() => import('./pages/HeatmapDoc'));
const ActivityFeedDoc = lazy(() => import('./pages/ActivityFeedDoc'));
const DashboardExample = lazy(() => import('./examples/DashboardExample'));
const BuilderWorkspace = lazy(() => import('./pages/BuilderWorkspace'));
const IconDoc = lazy(() => import('./pages/IconDoc'));
const FormDoc = lazy(() => import('./pages/FormDoc'));
const FlexDoc = lazy(() => import('./pages/FlexDoc'));
const TextDoc = lazy(() => import('./pages/TextDoc'));
const LayoutDoc = lazy(() => import('./pages/LayoutDoc'));
const GridDoc = lazy(() => import('./pages/GridDoc'));
const RowDoc = lazy(() => import('./pages/RowDoc'));
const SkeletonDoc = lazy(() => import('./pages/SkeletonDoc'));
const StatisticDoc = lazy(() => import('./pages/StatisticDoc'));
const ProgressDoc = lazy(() => import('./pages/ProgressDoc'));
const DescriptionDoc = lazy(() => import('./pages/DescriptionDoc'));
const ResultDoc = lazy(() => import('./pages/ResultDoc'));
const UploadDoc = lazy(() => import('./pages/UploadDoc'));
const TreeDoc = lazy(() => import('./pages/TreeDoc'));
const TreeSelectDoc = lazy(() => import('./pages/TreeSelectDoc'));
const AuroraBgDoc = lazy(() => import('./pages/AuroraBgDoc'));
const GradientTextDoc = lazy(() => import('./pages/GradientTextDoc'));
const NumberRollDoc = lazy(() => import('./pages/NumberRollDoc'));
const GlowCardDoc = lazy(() => import('./pages/GlowCardDoc'));
const PulseDotDoc = lazy(() => import('./pages/PulseDotDoc'));
const TickerTapeDoc = lazy(() => import('./pages/TickerTapeDoc'));
const ScrambleTextDoc = lazy(() => import('./pages/ScrambleTextDoc'));
const ConnectorDoc = lazy(() => import('./pages/ConnectorDoc'));

const AppShell: React.FC = () => {
  const loc = useLocation();
  const hideNavbar = loc.pathname.startsWith('/examples/');
  return (
    <>
      {!hideNavbar && <Navbar />}
      <Suspense fallback={<RouteFallback />}>
        <AppRoutes />
      </Suspense>
    </>
  );
};

const RouteFallback: React.FC = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      color: 'var(--au-text-3)',
      fontSize: 13,
    }}
  >
    加载中…
  </div>
);

const AppRoutes: React.FC = () => (
  <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/builder" element={<BuilderWorkspace />} />
      <Route path="/examples/dashboard" element={<DashboardExample />} />
      <Route path="/docs" element={<DocLayout />}>
        <Route index element={<Navigate to="getting-started" replace />} />
        <Route path="getting-started" element={<GettingStarted />} />
        <Route path="design" element={<Design />} />
        <Route path="button" element={<ButtonDoc />} />
        <Route path="input" element={<InputDoc />} />
        <Route path="card" element={<CardDoc />} />
        <Route path="switch" element={<SwitchDoc />} />
        <Route path="theme-switch" element={<ThemeSwitchDoc />} />
        <Route path="wallet" element={<WalletDoc />} />
        <Route path="tooltip" element={<TooltipDoc />} />
        <Route path="date-picker" element={<DatePickerDoc />} />
        <Route path="timeline" element={<TimelineDoc />} />
        <Route path="day-timeline" element={<DayTimelineDoc />} />
        <Route path="bar3d" element={<Bar3DDoc />} />
        <Route path="split" element={<SplitDoc />} />
        <Route path="typewriter" element={<TypewriterDoc />} />
        <Route path="flip" element={<FlipDoc />} />
        <Route path="pdf-download" element={<PdfDownloadDoc />} />
        <Route path="fullscreen-progress" element={<FullscreenProgressDoc />} />
        <Route path="top-progress" element={<TopProgressDoc />} />
        <Route path="draggable" element={<DraggableDoc />} />
        <Route path="select" element={<SelectDoc />} />
        <Route path="radio" element={<RadioDoc />} />
        <Route path="checkbox" element={<CheckboxDoc />} />
        <Route path="input-number" element={<InputNumberDoc />} />
        <Route path="slider" element={<SliderDoc />} />
        <Route path="modal" element={<ModalDoc />} />
        <Route path="drawer" element={<DrawerDoc />} />
        <Route path="message" element={<MessageDoc />} />
        <Route path="notification" element={<NotificationDoc />} />
        <Route path="popconfirm" element={<PopconfirmDoc />} />
        <Route path="alert" element={<AlertDoc />} />
        <Route path="spin" element={<SpinDoc />} />
        <Route path="tag" element={<TagDoc />} />
        <Route path="badge" element={<BadgeDoc />} />
        <Route path="avatar" element={<AvatarDoc />} />
        <Route path="empty" element={<EmptyDoc />} />
        <Route path="divider" element={<DividerDoc />} />
        <Route path="space" element={<SpaceDoc />} />
        <Route path="pagination" element={<PaginationDoc />} />
        <Route path="tabs" element={<TabsDoc />} />
        <Route path="table" element={<TableDoc />} />
        <Route path="menu" element={<MenuDoc />} />
        <Route path="dropdown" element={<DropdownDoc />} />
        <Route path="steps" element={<StepsDoc />} />
        <Route path="breadcrumb" element={<BreadcrumbDoc />} />
        <Route path="sparkline" element={<SparklineDoc />} />
        <Route path="kpi-card" element={<KpiCardDoc />} />
        <Route path="gauge" element={<GaugeDoc />} />
        <Route path="funnel" element={<FunnelDoc />} />
        <Route path="heatmap" element={<HeatmapDoc />} />
        <Route path="activity-feed" element={<ActivityFeedDoc />} />
        <Route path="icon" element={<IconDoc />} />
        <Route path="form" element={<FormDoc />} />
        <Route path="flex" element={<FlexDoc />} />
        <Route path="text" element={<TextDoc />} />
        <Route path="layout" element={<LayoutDoc />} />
        <Route path="grid" element={<GridDoc />} />
        <Route path="row" element={<RowDoc />} />
        <Route path="skeleton" element={<SkeletonDoc />} />
        <Route path="statistic" element={<StatisticDoc />} />
        <Route path="progress" element={<ProgressDoc />} />
        <Route path="description" element={<DescriptionDoc />} />
        <Route path="result" element={<ResultDoc />} />
        <Route path="upload" element={<UploadDoc />} />
        <Route path="tree" element={<TreeDoc />} />
        <Route path="tree-select" element={<TreeSelectDoc />} />
        <Route path="aurora-bg" element={<AuroraBgDoc />} />
        <Route path="gradient-text" element={<GradientTextDoc />} />
        <Route path="number-roll" element={<NumberRollDoc />} />
        <Route path="glow-card" element={<GlowCardDoc />} />
        <Route path="pulse-dot" element={<PulseDotDoc />} />
        <Route path="ticker-tape" element={<TickerTapeDoc />} />
        <Route path="scramble-text" element={<ScrambleTextDoc />} />
        <Route path="connector" element={<ConnectorDoc />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
);

const App: React.FC = () => (
  <BrowserRouter>
    <AppShell />
  </BrowserRouter>
);

export default App;

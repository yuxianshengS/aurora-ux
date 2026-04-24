import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './site-components/Navbar';
import DocLayout from './layouts/DocLayout';
import Home from './pages/Home';
import GettingStarted from './pages/GettingStarted';
import Design from './pages/Design';
import ButtonDoc from './pages/ButtonDoc';
import InputDoc from './pages/InputDoc';
import CardDoc from './pages/CardDoc';
import SwitchDoc from './pages/SwitchDoc';
import ThemeSwitchDoc from './pages/ThemeSwitchDoc';
import WalletDoc from './pages/WalletDoc';
import TooltipDoc from './pages/TooltipDoc';
import DatePickerDoc from './pages/DatePickerDoc';
import TimelineDoc from './pages/TimelineDoc';
import DayTimelineDoc from './pages/DayTimelineDoc';
import Bar3DDoc from './pages/Bar3DDoc';
import SplitDoc from './pages/SplitDoc';
import TypewriterDoc from './pages/TypewriterDoc';
import FlipDoc from './pages/FlipDoc';
import PdfDownloadDoc from './pages/PdfDownloadDoc';
import FullscreenProgressDoc from './pages/FullscreenProgressDoc';
import TopProgressDoc from './pages/TopProgressDoc';
import DraggableDoc from './pages/DraggableDoc';
import SelectDoc from './pages/SelectDoc';
import RadioDoc from './pages/RadioDoc';
import CheckboxDoc from './pages/CheckboxDoc';
import InputNumberDoc from './pages/InputNumberDoc';
import SliderDoc from './pages/SliderDoc';
import ModalDoc from './pages/ModalDoc';
import DrawerDoc from './pages/DrawerDoc';
import MessageDoc from './pages/MessageDoc';
import NotificationDoc from './pages/NotificationDoc';
import PopconfirmDoc from './pages/PopconfirmDoc';
import AlertDoc from './pages/AlertDoc';
import SpinDoc from './pages/SpinDoc';
import TagDoc from './pages/TagDoc';
import BadgeDoc from './pages/BadgeDoc';
import AvatarDoc from './pages/AvatarDoc';
import EmptyDoc from './pages/EmptyDoc';
import DividerDoc from './pages/DividerDoc';
import SpaceDoc from './pages/SpaceDoc';
import PaginationDoc from './pages/PaginationDoc';
import TabsDoc from './pages/TabsDoc';
import TableDoc from './pages/TableDoc';
import MenuDoc from './pages/MenuDoc';
import DropdownDoc from './pages/DropdownDoc';
import StepsDoc from './pages/StepsDoc';
import BreadcrumbDoc from './pages/BreadcrumbDoc';
import SparklineDoc from './pages/SparklineDoc';
import KpiCardDoc from './pages/KpiCardDoc';
import GaugeDoc from './pages/GaugeDoc';
import FunnelDoc from './pages/FunnelDoc';
import HeatmapDoc from './pages/HeatmapDoc';
import ActivityFeedDoc from './pages/ActivityFeedDoc';
import DashboardExample from './examples/DashboardExample';
import BuilderWorkspace from './pages/BuilderWorkspace';
import IconDoc from './pages/IconDoc';
import FormDoc from './pages/FormDoc';

const AppShell: React.FC = () => {
  const loc = useLocation();
  const hideNavbar = loc.pathname.startsWith('/examples/');
  return (
    <>
      {!hideNavbar && <Navbar />}
      <AppRoutes />
    </>
  );
};

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

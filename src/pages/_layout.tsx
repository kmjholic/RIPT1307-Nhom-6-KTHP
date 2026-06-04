import React, { useState } from 'react';
import { Layout, Drawer, Button } from 'antd';
import { Outlet, useLocation, history } from '@umijs/max';
import {
  MenuOutlined,
  HomeOutlined,
  CommentOutlined,
  EditOutlined,
  TagsOutlined,
  TrophyOutlined,
} from '@ant-design/icons';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

import styles from '@/layouts/index.less';
import '@/styles/variables.less';

const { Content } = Layout;

const FULL_WIDTH_PAGES = ['/login', '/register'];

export default function AppLayout() {
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const isFullWidth = FULL_WIDTH_PAGES.includes(location.pathname);

  return (
    <div className={styles.appWrapper}>
      <Header />

      <Layout className={styles.mainLayout}>
        {!isFullWidth && (
          <>
            <aside className={styles.desktopSidebar}>
              <Sidebar />
            </aside>

            <Button
              className={styles.mobileSidebarToggle}
              icon={<MenuOutlined />}
              onClick={() => setMobileDrawerOpen(true)}
              type="primary"
              danger
            />

            <Drawer
              placement="left"
              open={mobileDrawerOpen}
              onClose={() => setMobileDrawerOpen(false)}
              width={280}
              className={styles.mobileDrawer}
              styles={{ body: { padding: 0 } }}
            >
              <Sidebar onClose={() => setMobileDrawerOpen(false)} />
            </Drawer>
          </>
        )}

        <Content
          className={`${styles.content} ${
            isFullWidth ? styles.fullWidth : ''
          }`}
        >
          <Outlet />
        </Content>
      </Layout>

      <nav className={styles.mobileBottomNav}>
        <button
          className={styles.navItem}
          onClick={() => history.push('/home')}
        >
          <HomeOutlined />
          <span>Trang Chủ</span>
        </button>

        <button
          className={styles.navItem}
          onClick={() => history.push('/forum')}
        >
          <CommentOutlined />
          <span>Diễn Đàn</span>
        </button>

        <button
          className={`${styles.navItem} ${styles.navItemCenter}`}
          onClick={() => history.push('/post/new')}
        >
          <EditOutlined />
          <span>Đăng</span>
        </button>

        <button
          className={styles.navItem}
          onClick={() => history.push('/tags')}
        >
          <TagsOutlined />
          <span>Thẻ</span>
        </button>

        <button
          className={styles.navItem}
          onClick={() => history.push('/leaderboard')}
        >
          <TrophyOutlined />
          <span>Xếp Hạng</span>
        </button>
      </nav>
    </div>
  );
}

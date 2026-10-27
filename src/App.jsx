import React, { useState, useEffect } from 'react';
import { WpAdminBar } from './components/WpAdminBar.jsx';
import { WpSidebar } from './components/WpSidebar.jsx';
import { WpDashboardTab } from './pages/admin/WpDashboardTab.jsx';
import { WpPostsTab } from './pages/admin/WpPostsTab.jsx';
import { WpPostEditor } from './pages/admin/WpPostEditor.jsx';
import { WpPluginsTab } from './pages/admin/WpPluginsTab.jsx';
import { WpSettingsTab } from './pages/admin/WpSettingsTab.jsx';
import { api } from './core/apiClient.js';
import { cms } from './core/HookEngine.js';
import { SmartSeoPlugin } from './plugins/smart-seo/index.js';

export default function App() {
  const [currentTab, setCurrentTab] = useState('plugins'); // Inicia na tela de plugins para bater com o screenshot!
  const [posts, setPosts] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    SmartSeoPlugin.setup(cms);
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const res = await api.listPosts();
      setPosts(res.rows || []);
    } catch (err) {
      console.error('Erro ao listar posts:', err);
    }
  };

  const handleNewPost = () => {
    setEditingPost({ title: '', slug: '', content_html: '', status: 'published', meta: {} });
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
  };

  const stats = {
    totalPosts: posts.length,
    activePlugins: 1
  };

  return (
    <div className="flex flex-col h-screen bg-[#f0f0f1] text-[#2c3338] overflow-hidden font-sans antialiased">
      {/* 1. Barra Superior Clássica do WordPress (32px) */}
      <WpAdminBar
        onNavigate={(tab) => {
          setEditingPost(null);
          setCurrentTab(tab);
        }}
        onNewPost={handleNewPost}
      />

      {/* 2. Área Central: Menu Lateral + Conteúdo */}
      <div className="flex flex-1 overflow-hidden">
        {/* Menu Lateral do WordPress (Apenas o básico) */}
        <WpSidebar
          currentTab={editingPost ? 'posts' : currentTab}
          setCurrentTab={(tab) => {
            setEditingPost(null);
            setCurrentTab(tab);
          }}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        {/* Área de Conteúdo Principal */}
        <main className="flex-1 overflow-y-auto p-5">
          <div className="max-w-[1200px]">
            {editingPost ? (
              <WpPostEditor
                initialPost={editingPost}
                onSaveSuccess={() => {
                  loadPosts();
                  setEditingPost(null);
                }}
                onCancel={() => setEditingPost(null)}
              />
            ) : (
              <>
                {currentTab === 'dashboard' && (
                  <WpDashboardTab
                    stats={stats}
                    posts={posts}
                    onRefresh={loadPosts}
                    onNavigate={setCurrentTab}
                    onNewPost={handleNewPost}
                  />
                )}
                {currentTab === 'posts' && (
                  <WpPostsTab
                    posts={posts}
                    onRefresh={loadPosts}
                    onEditPost={handleEditPost}
                    onNewPost={handleNewPost}
                  />
                )}
                {currentTab === 'pages' && (
                  <WpPostsTab
                    posts={posts.filter(p => p.type === 'page')}
                    onRefresh={loadPosts}
                    onEditPost={handleEditPost}
                    onNewPost={handleNewPost}
                  />
                )}
                {currentTab === 'plugins' && (
                  <WpPluginsTab />
                )}
                {currentTab === 'settings' && (
                  <WpSettingsTab onConfigSaved={loadPosts} />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

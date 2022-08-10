module.exports = {
    port: '8888', //端口号
    title: 'vuepress', // 网站的标题
    description: 'vuepress', // 网站的描述，它将会以 <meta> 标签渲染到当前页面的 HTML 中。
    head: [
      ['link', { rel: 'icon', href: '/public/logo.png' }] // 需要被注入到当前页面的 HTML <head> 中的标签
    ],
    themeConfig: {
      logo: '/logo.png',
      // 请参考文档来查看所有可用的选项。
      nav: [
        { text: '指南', link: '/guide/install' },
      ],
      // 更新时间 由于 lastUpdated 是基于 git 的, 所以你只能在一个基于 git 的项目中启用它。在本地将文件提交到本地仓库也可以看到lastUpdated。
      lastUpdated: 'Last Updated', // string | boolean
      searchMaxSuggestions: 10,//调整默认搜索框显示的搜索结果数量，最大为10
      search: false ,//禁用内置搜索框。false为禁用，默认为true
      sidebarDepth: 2, //侧边栏显示层数
      sidebar:{ //侧边栏分组
        '/guide/':[
          {
            title: '新手入门', 
            path: '/guide/install', 
            children: [
              '/guide/install',//安装与注册
            ]
          },
          {
            title: '部署及安装指南',  
            path: '/guide/deploy',     
            children: [
              '/guide/deploy',//使用宝塔面板部署
              '/guide/enterprise-deploy',//企业版部署指南(centos7)
            ]
          },
        ]
      }
    }
  }
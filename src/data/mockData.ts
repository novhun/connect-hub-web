import { User, Story, Post, Group, NotificationItem } from '../types';

export const CURRENT_USER: User = {
  id: 'user-sokun',
  name: 'Sokun',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1horplrAC7-0mqM4pGaHQzkfN9hQFEbB-LQk1RVMQWmH4kvrm5Wi2JO13QXkYhIOkj4bbOvM2aNCt0HSVS1T0zd8j13I9XWJsCMLRdo0vKr96D66Qo_Vn_6n0gZc0kEdYkxfj1JWmlK6xcp_K-cL30veV-dcIDDc0mgJsnZ2BPcJzZigeSg8ujHuBS90WEtA2SijWotiMoc3XWG7OIZC9yEMnaTkUHaIBTImIm1YuUfbVS1u5VXgt',
  role: 'Product Designer',
  isOnline: true,
};

export const ONLINE_MEMBERS: User[] = [
  {
    id: 'user-dara',
    name: 'Dara Kim',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3okZWj4HdiL1vFZUSxOjHIkXN_ZhmWwuflHAs89NBEBGO3KEg_K6q2-cxZVAGBNJR6ldoF2W8aJMf_-TfyWJIu8DDd7_3q4ALj3Vn8yt6_cqJJgOcW-mBiucYNZlXK2AgM3RjoeyGTc1omUabuTCgmTL8qP2wgc6hJJdfslDdjuch_0br44NUvM5P9t4KBSujHTQY0f5M1IxoAjvhz3xFcGafaPCZHAz_zukIikEULBMf15pmexPJ',
    role: 'Senior Frontend Dev',
    isOnline: true,
  },
  {
    id: 'user-vireak',
    name: 'Vireak Nith',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACuRj8AsvmCk2C2ENMoXlaCBrk84ZIKWvia4_9KT38863N9ix0u4y5ubDCWxMQhGO6-JCsif_vm2roezQLKxqA0FI7gq1hniWl9N9pIsv6E9AtN99rH6X0bNjvTFzX1Ukl_3WegDUjbGZXpET760vP40KxgLYcfW8_Kin6hbWtqRxh3_QzKVsVS23PoygcfgdhnPmERGdKOlx93kP_HjJIosc3nvQc86KJ-yEnQqH_9pQ5wppN0atI',
    role: 'Cloud Architect',
    isOnline: true,
  },
  {
    id: 'user-sokunthea',
    name: 'Sokunthea Pen',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1qIT7A6u_m_KGG2bLC9XgjB1WX48cvdwhF-6-IXqZLzf2sg819AmILZLR2_F5N_Doxi60Xrf7YkP8JKPGnF220G5VnhmeU051WWcH7pEcc9YLHlPS-xJHJV4_TAMlWYUwNpLXg-iE8ufsOSnTHp02SPkPOXuvzEnCtWn-WhPgURlxHNoyHpISs_NbijzQt5zCc5lp0AmgcayHfAKNiz00uu-Jk1HpfDW-zAMmp4XSDN13-VR1YHg3',
    role: 'Product Lead',
    isOnline: true,
  },
  {
    id: 'user-chanda',
    name: 'Chanda Meas',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Graphic Designer',
    isOnline: false,
    lastSeen: '15m ago',
  },
  {
    id: 'user-bopha',
    name: 'Bopha Chen',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    role: 'Mobile Engineer',
    isOnline: true,
  }
];

export const INITIAL_STORIES: Story[] = [
  {
    id: 'story-1',
    userId: 'user-dara',
    userName: 'Dara',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpkwNNENrcnQgJTOUuPnsOgGqyoVL4j31dhHDu_4j8VqwwVgMAdDrQh3kE6EMPiO9MIF07y3bUZC8TPmQZIs7YG5kdY87PuSwWE6H6QsExk3gYGs8vKrZWxzvKS-ujmKO8Ko9vAGAleV160F2mGYm60zACLZbIGkdRsXqw9ywLx4kdXzu_AFvK8ZuF7PmpMM0Vdp2VJPWhqpOblAId9eRfWIZlEhBWB6cSGXLXMST-TWlNxdlbqrun',
    storyImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmgd7Eo3HN-MvSLFtCvYIssbACFz_fXKPbEycxS4NSmz0YfVF6Xwg6InI_c3xTqdATHLIeFyZCJ50rLYSVpJcI0hr-C1LTGqoeKN0grey90KZgJLdk1lW2VeY411T_tZdqEjQ-mua2Ji6E8vi3cnvtQZdejgKEGwDM1M711xTRAYy5mjIqgybRMvGVtcxKYY5YEwimeA1_QcziLo4xj0lUvaAq-7VzRTJT911CdUOW-aTLBKIC9Eej',
    timestamp: '2h ago',
    caption: 'Sunrise over the misty pine valley! 🌲✨'
  },
  {
    id: 'story-2',
    userId: 'user-vireak',
    userName: 'Vireak',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVlq2aGp8GKVZl4GDXc0yfwrxffQTq7idwiiDThx7Q5voy5f7nfRzl6mAuw2tLJPZNg1pwI8rRpBce7O9mtuujCDCuSsGxnyl1tKHwVSra5mZ0SfpLdZqxSFL5P2vakkVoD6rsLp82zbVk8BJ4sn3cQB_SFK-79eJBmYvJRycW_GV8RCEpF1o3DsCEWcCDl-6tHl5XsUiYbVQjaxuqJ1jsWfTucFM36RWMt0MiG7B9qRpHD0wEQFFO',
    storyImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD69O9PDlJuSAwbVDyhA0pkNx2U-NBnp6xTyUH2F4Jx7-hNf_1o9DLCFVO_0aKQweQ_sZVbtMCTJUoc6Lm7jiJcCrfiB9nKjY7tiC9YriooTvhzJTMaJbbZu3g5Mp-y8OMMicuVdLHWW6bc9_pWXp2QpsiwiHhS9zqDL-ERAmWDBgMNLoJ8F5XUwaFGfcYHLPtufjSiscefqcewjHrzC1W56UuNWKKiXcYnDLE_fYWfSzt1AAF8XFqx',
    timestamp: '5h ago',
    caption: 'Testing the new camera gear in the alpine pass 📷'
  },
  {
    id: 'story-3',
    userId: 'user-sokunthea',
    userName: 'Sokunthea',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRqmjCXcT9e79bYOuDEaPWc-230RB0gN4VCZ11HzbmxzjG3X6Cmn1gyqJ4UI5RFaFepZvyrbnMRoiM55abp1906zDXHQOYu4LAoIRSF2VFWh4Mr_qZt6hQPacTnAj8m59hKUIm3eYbBs5O63QXs0GWKCy2ObbVQcYmDLqy7_eEvmOa2ymlZyEiQdNlKPgvkWMu3Acgmpwzj19fKtXOrubhcOMy-K_px1Ja_SOQDDM5QRxo0CxVPSuT',
    storyImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsdNeOaSY6BThEUzBImvL09qA1aPnAHQTmIcIsNXgWU6eSV8c9cA2avPXUHupn8jej_bkyLy_PkzLOfOlacGKgEKtP1-b1f2lPnhPWdk_g6GlN9Q36XWC1UhS8x_NgjQNpT5GiNtfeZ3yg87ilz5Z4o2JRtJw1TrdL4Ci1241nBPSn7kb4ZlcmVrFn2zhjMGVsXqmBTIDyFP5uRL1oZPWC8igL4XSZop3GiYn-t6QgrHnLfCY6CPQV',
    timestamp: '1d ago',
    caption: 'Weekend coffee and design sketching ☕🎨'
  },
  {
    id: 'story-4',
    userId: 'user-bopha',
    userName: 'Bopha',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    storyImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    timestamp: '1d ago',
    caption: 'Lakeside tranquility during afternoon golden hour 🌅'
  }
];

export const GROUPS_DATA: Group[] = [
  {
    id: 'grp-tech',
    name: 'Tech Enthusiasts',
    icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCplSj6BXPkfU_Iuh9sCT6pU65aKiS8Lob6Y1Ln5maOzufu3HkSd-j6k1rVqM7mtUd-2_rvFEgwIm6RfdtPo58R2TMfZA1wL66In_JmVzgQgr79S_yx2faFOYNZXwvXWTaAGj13UQooaKQylMVNQ3nbtkwArrSDi88vS83F0F-368wG8Efvo0RMJRxb1se9QRyoNIjvHOa_pL5rxe2L637EV1hB7CnqUd0peC3Bi2R1rkZzREcgFnkN',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    description: 'A global community discussing the latest tech breakthroughs, AI software architecture, and gadgets.',
    isPrivate: false,
    membersCount: '12.5K members',
    membersNumber: 12500,
    isManaged: true,
    joined: true,
    recentPostsCount: 42
  },
  {
    id: 'grp-uiux',
    name: 'UI/UX Designers',
    icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRRlN5DD-lED5gfSGLn7U3pCB0KIARkA5YYZCtXQWv9kp7a5S6sbaJfofdKki12Yr4mev-KoIQSpImVOG1IewyZYTOfTVBHgKbSFo8Skiwqz-5Mol2Wjz9gOySg9KyXgYNKYjqsraa6qo-Y-egIwKgQsqjX469BdWK2bJHdBLJ88lKE-19EnY6yUNj84K5EX0r8zaEZo-1JdMvDyDnfyBmlcjdu-wsB45hYQZ06ok7v1f01JmwbSJJ',
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    description: 'Design critiques, Figma tips, design systems, UX research methods, and interactive prototypes.',
    isPrivate: true,
    membersCount: '8.1K members',
    membersNumber: 8100,
    isManaged: true,
    joined: true,
    recentPostsCount: 28
  },
  {
    id: 'grp-travel',
    name: 'Travel Lovers',
    icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChfJywX8hzrUbFjmEHzHu8Lrt3OyhjzXfew1s214yoyZvnWNJeKHUsHwHTV3pwdeL0-SXLF4A3Neq5Vs153CiOU_cgWO9JDO6hn-zQPzrQ013dWL1aJgUPTFhA6o4L6ouitQ4zIU7HLaPcSNiE5AmSmXdWxac75RDpYbrTCY0xBjc9w79JpJGtFpuRPma0OIlLR53nRo2Q8XBhR3eTwhO_TJZg_QuoJMRj-i8VKjsQuz1w9OCDx_8',
    coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80',
    description: 'Share your travel itineraries, photography, hiking spots, and discover hidden gems worldwide.',
    isPrivate: false,
    membersCount: '19.3K members',
    membersNumber: 19300,
    isManaged: false,
    joined: true,
    recentPostsCount: 65
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    author: {
      id: 'user-dara',
      name: 'Dara Kim',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNnzTeUFMog1CdY-I_wA3Ez8utaId-TDrYsUzta-grW7LjiEqFG7Ka603clgcv18AKWdfmu3DoT53WGpHsTTmuFMDnVqmly3VL1Rbp3_PoJIbdHACV2jZV6oJtZHXjcUack2DO1IWv5ds8jbYu2EqMkB_CMsvhJklrqxTiezadThIeRBKMQOQbHSGw_6NkpMW54Iy3XsfnJkjQLapdEeMqTFVO2RQ1YyAjU6NpZgIcXXFRnRrwpT1N',
      role: 'Senior Developer',
      isOnline: true,
    },
    timestamp: '2h ago',
    privacy: 'public',
    content: 'Just finished an amazing hike with friends! ⛰️\nNature always finds a way to heal the soul.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAMegsuKTHwuxVrN3neJU1g9JA_MfR5GVQTQy3SYqJbbh6VIVb_yfMFS9NjUDHPvNkDYndzE3Yj5J5eTO0h-h-rYwAD8wWdTgyZP9zxgF-xbxUuCqJfXQngkeBVcyMAYrmj3GPBfW8pDoFCLkA5_rAyhXxs4iValRnmXq08brtQvKZZdAG-lEL46SOLkR1nDV_0uyG5AY5zAma8VETQtsS-hoacMO_gDMD9mjQS4J-jHGKa-561ywGG',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCPFOaXWrHjwtTU3DO_OWmgDYNRHto2p5GHOLttnNoAN0ghcfpokm04TFfyAQxmjYrtXAHMQb3jXl65LYHMKpTZrMYlFycSFT0B-chUwMrbw9weFpoPC0aheKbwTKVrc0gkxPEmAekGEy1chSpLLR4mEKFufh9nzwYoJVlM70WJzNNidmnXciB9nxqL2EqHkqMbytBTDixLud3a2bK7jfLSDQcJlzNQZT8R6eTRJ7yLeEJ28uBKcyYH',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCFdrymCnIajKQp8-WY6QPvXkud6BAUpGe6dBLcLB-lI7uzkIIQfEH07GLSEo2acR9n2MfiQMMDpYYYcKTycRO8zs6w3NdScQIgsxf3U-N1tGtZ6Z-OlV1Xb7YM4txpZI6A0ml5zWi4bp6kersZlXSWqQSGCn7Wc7Wy4g8iiEpjrY44DdSmle4fpE36TaIANK8yKX6XaoNEORWHJV3MnMRcVzAhpn1JauTltEKufwM1BFVuS_9Ss_2q'
    ],
    reactionCounts: {
      like: 98,
      love: 24,
      care: 4,
      haha: 2,
      wow: 3,
      sad: 0,
      angry: 0
    },
    userReaction: 'like',
    comments: [
      {
        id: 'c-1',
        user: {
          id: 'user-vireak',
          name: 'Vireak Nith',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACuRj8AsvmCk2C2ENMoXlaCBrk84ZIKWvia4_9KT38863N9ix0u4y5ubDCWxMQhGO6-JCsif_vm2roezQLKxqA0FI7gq1hniWl9N9pIsv6E9AtN99rH6X0bNjvTFzX1Ukl_3WegDUjbGZXpET760vP40KxgLYcfW8_Kin6hbWtqRxh3_QzKVsVS23PoygcfgdhnPmERGdKOlx93kP_HjJIosc3nvQc86KJ-yEnQqH_9pQ5wppN0atI',
        },
        content: 'That mountain trail looks absolutely stunning! Which summit did you climb?',
        timestamp: '1h ago',
        likes: 5,
        isLiked: true,
      },
      {
        id: 'c-2',
        user: {
          id: 'user-sokunthea',
          name: 'Sokunthea Pen',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1qIT7A6u_m_KGG2bLC9XgjB1WX48cvdwhF-6-IXqZLzf2sg819AmILZLR2_F5N_Doxi60Xrf7YkP8JKPGnF220G5VnhmeU051WWcH7pEcc9YLHlPS-xJHJV4_TAMlWYUwNpLXg-iE8ufsOSnTHp02SPkPOXuvzEnCtWn-WhPgURlxHNoyHpISs_NbijzQt5zCc5lp0AmgcayHfAKNiz00uu-Jk1HpfDW-zAMmp4XSDN13-VR1YHg3',
        },
        content: 'Love the golden lighting in that first shot! Glad you had a great trip 🌿🙌',
        timestamp: '45m ago',
        likes: 3,
        isLiked: false,
      }
    ],
    sharesCount: 5,
    isSaved: false,
  },
  {
    id: 'post-2',
    author: {
      id: 'user-vireak',
      name: 'Vireak Nith',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACuRj8AsvmCk2C2ENMoXlaCBrk84ZIKWvia4_9KT38863N9ix0u4y5ubDCWxMQhGO6-JCsif_vm2roezQLKxqA0FI7gq1hniWl9N9pIsv6E9AtN99rH6X0bNjvTFzX1Ukl_3WegDUjbGZXpET760vP40KxgLYcfW8_Kin6hbWtqRxh3_QzKVsVS23PoygcfgdhnPmERGdKOlx93kP_HjJIosc3nvQc86KJ-yEnQqH_9pQ5wppN0atI',
      role: 'Cloud Architect',
      isOnline: true,
    },
    timestamp: '4h ago',
    privacy: 'public',
    content: 'Excited to announce our new open source UI component system for React 19 and Tailwind CSS! 🚀 Check out the interactive playground and clean modular layout tokens.',
    taggedGroup: 'Tech Enthusiasts',
    images: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&auto=format&fit=crop&q=80'
    ],
    reactionCounts: {
      like: 142,
      love: 48,
      care: 12,
      haha: 1,
      wow: 15,
      sad: 0,
      angry: 0
    },
    userReaction: null,
    comments: [
      {
        id: 'c-3',
        user: {
          id: 'user-dara',
          name: 'Dara Kim',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNnzTeUFMog1CdY-I_wA3Ez8utaId-TDrYsUzta-grW7LjiEqFG7Ka603clgcv18AKWdfmu3DoT53WGpHsTTmuFMDnVqmly3VL1Rbp3_PoJIbdHACV2jZV6oJtZHXjcUack2DO1IWv5ds8jbYu2EqMkB_CMsvhJklrqxTiezadThIeRBKMQOQbHSGw_6NkpMW54Iy3XsfnJkjQLapdEeMqTFVO2RQ1YyAjU6NpZgIcXXFRnRrwpT1N',
        },
        content: 'Clean architecture! Already testing this on our staging branch.',
        timestamp: '2h ago',
        likes: 7,
        isLiked: false,
      }
    ],
    sharesCount: 18,
    isSaved: true,
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    user: {
      id: 'user-dara',
      name: 'Dara Kim',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNnzTeUFMog1CdY-I_wA3Ez8utaId-TDrYsUzta-grW7LjiEqFG7Ka603clgcv18AKWdfmu3DoT53WGpHsTTmuFMDnVqmly3VL1Rbp3_PoJIbdHACV2jZV6oJtZHXjcUack2DO1IWv5ds8jbYu2EqMkB_CMsvhJklrqxTiezadThIeRBKMQOQbHSGw_6NkpMW54Iy3XsfnJkjQLapdEeMqTFVO2RQ1YyAjU6NpZgIcXXFRnRrwpT1N',
    },
    type: 'like',
    content: 'reacted to your comment in Tech Enthusiasts',
    timestamp: '10m ago',
    isRead: false,
  },
  {
    id: 'notif-2',
    user: {
      id: 'user-vireak',
      name: 'Vireak Nith',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACuRj8AsvmCk2C2ENMoXlaCBrk84ZIKWvia4_9KT38863N9ix0u4y5ubDCWxMQhGO6-JCsif_vm2roezQLKxqA0FI7gq1hniWl9N9pIsv6E9AtN99rH6X0bNjvTFzX1Ukl_3WegDUjbGZXpET760vP40KxgLYcfW8_Kin6hbWtqRxh3_QzKVsVS23PoygcfgdhnPmERGdKOlx93kP_HjJIosc3nvQc86KJ-yEnQqH_9pQ5wppN0atI',
    },
    type: 'comment',
    content: 'mentioned you in a post: "Take a look at Sokun\'s new mockups"',
    timestamp: '1h ago',
    isRead: false,
  },
  {
    id: 'notif-3',
    user: {
      id: 'user-sokunthea',
      name: 'Sokunthea Pen',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1qIT7A6u_m_KGG2bLC9XgjB1WX48cvdwhF-6-IXqZLzf2sg819AmILZLR2_F5N_Doxi60Xrf7YkP8JKPGnF220G5VnhmeU051WWcH7pEcc9YLHlPS-xJHJV4_TAMlWYUwNpLXg-iE8ufsOSnTHp02SPkPOXuvzEnCtWn-WhPgURlxHNoyHpISs_NbijzQt5zCc5lp0AmgcayHfAKNiz00uu-Jk1HpfDW-zAMmp4XSDN13-VR1YHg3',
    },
    type: 'group',
    content: 'invited you to join UI/UX Designers weekly critique meetup',
    timestamp: '3h ago',
    isRead: false,
  },
  {
    id: 'notif-4',
    user: {
      id: 'user-bopha',
      name: 'Bopha Chen',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
    type: 'call',
    content: 'started an audio call in General Room',
    timestamp: '1d ago',
    isRead: true,
  }
];

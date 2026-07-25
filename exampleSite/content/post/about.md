+++
# 标题
title = "关于我"
# 日期，影响排序和归档
date = 2020-05-20
# 是否是草稿，草稿状态不发布
draft = false
# 文章摘要，常用于SEO和列表页
description = "dycn,关于我,介绍"
# 排序权重，越小越靠前
weight = 1

categories = ["关于我"]
tags = ["关于我"]

url = "/aboutme"
slug = "aboutme"
# 为文章指定一张特色图片，很多主题用它来做封面
image= "/img/avatar.png"

author= "dycn"

[params]
    link = "https://www.baidu.com"
    
+++

About Me
- 一份自我介绍模版

- 虚IP
    - 不与特定计算机或者特定网卡相对应的IP地址，所有发往这个IP的数据包都经过真实网卡到达目的机器的目的进程
    - 比较常见用在系统高可用中，通常系统会因为日常维护或非计划外的情况宕机，为了提高系统对外服务可用性，会采取 `主备模式` 进行高可用配置，当服务当主机M宕机后，服务会切换到备用主机S继续对外服务。这一切用户感知不到，这情况下系统对客户端提供服务对地址是虚拟ip
    - arp 缓存绑定ip和mac地址
    - 虚ip绑定M的mac 如果宕机 则绑定S的mac地址 M就无法通信 所以需要刷新其他主机的arp缓存
    - garp (无端arp或免费arp)
    
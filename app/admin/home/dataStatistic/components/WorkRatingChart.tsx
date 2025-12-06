'use client';
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface WorkRatingChartProps {
  workStatistics: Array<{
    workId: number;
    workName: string;
    ratedCount: number;
    highestScore: number;
    lowestScore: number;
    averageScore: number;
  }>;
}

const WorkRatingChart: React.FC<WorkRatingChartProps> = ({ workStatistics }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // 初始化图表
  const initChart = () => {
    if (!chartRef.current || !workStatistics) return;

    // 销毁旧图表实例
    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    // 创建新图表实例
    chartInstance.current = echarts.init(chartRef.current);

    // 准备图表数据
    const workNames = workStatistics.map(work => work.workName);
    const ratedCounts = workStatistics.map(work => work.ratedCount);
    const averageScores = workStatistics.map(work => work.averageScore);
    const highestScores = workStatistics.map(work => work.highestScore);
    const lowestScores = workStatistics.map(work => work.lowestScore);

    // 配置图表选项
    const option: any = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: 'rgba(106, 121, 133, 0.9)',
            color: '#fff',
            borderRadius: 4,
            padding: [5, 10]
          }
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 6,
        borderColor: '#ddd',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        },
        padding: 12
      },
      legend: {
        data: ['评分人数', '平均评分', '最高分', '最低分'],
        top: 0,
        textStyle: {
          color: '#666',
          fontSize: 13
        },
        itemWidth: 12,
        itemHeight: 12
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      toolbox: {
        iconStyle: {
          borderColor: '#666'
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        data: workNames,
        axisLabel: {
          rotate: 45,
          color: '#666',
          fontSize: 12,
          margin: 15
        },
        axisLine: {
          lineStyle: {
            color: '#e8e8e8'
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '评分人数',
          nameGap: 40,
          min: 0,
          interval: 1,
          nameTextStyle: {
            color: '#666',
            fontSize: 12,
            align: 'center'
          },
          axisLabel: {
            formatter: '{value}',
            color: '#666',
            fontSize: 12
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0',
              type: 'dashed'
            }
          }
        },
        {
          type: 'value',
          name: '平均评分',
          nameGap: 40,
          min: 0,
          max: 100,
          nameTextStyle: {
            color: '#666',
            fontSize: 12,
            align: 'center'
          },
          axisLabel: {
            formatter: '{value}',
            color: '#666',
            fontSize: 12
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        }
      ],
      series: [
        {
          name: '评分人数',
          type: 'bar',
          data: ratedCounts,
          barWidth: '30%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#40a9ff' },
              { offset: 1, color: '#1890ff' }
            ]),
            borderRadius: [6, 6, 0, 0],
            shadowColor: 'rgba(24, 144, 255, 0.3)',
            shadowBlur: 10,
            shadowOffsetY: 5
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#69c0ff' },
                { offset: 1, color: '#40a9ff' }
              ])
            }
          },
          animationDelay: (idx: number) => idx * 30
        },
        {
          name: '平均评分',
          type: 'line',
          yAxisIndex: 1,
          data: averageScores,
          smooth: true,
          symbol: 'circle',
          symbolSize: 10,
          lineStyle: {
            width: 4,
            color: '#52c41a'
          },
          itemStyle: {
            color: '#52c41a',
            borderColor: '#fff',
            borderWidth: 2
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
              { offset: 1, color: 'rgba(82, 196, 26, 0.1)' }
            ])
          },
          emphasis: {
            itemStyle: {
              symbolSize: 12,
              color: '#73d13d'
            }
          },
          animationDelay: (idx: number) => idx * 30 + 100
        },
        {
          name: '最高分',
          type: 'line',
          yAxisIndex: 1,
          data: highestScores,
          smooth: true,
          symbol: 'circle',
          symbolSize: 10,
          lineStyle: {
            width: 3,
            color: '#ff4d4f',
            type: 'dashed'
          },
          itemStyle: {
            color: '#ff4d4f',
            borderColor: '#fff',
            borderWidth: 2
          },
          emphasis: {
            itemStyle: {
              symbolSize: 12,
              color: '#ff7875'
            }
          },
          animationDelay: (idx: number) => idx * 30 + 200
        },
        {
          name: '最低分',
          type: 'line',
          yAxisIndex: 1,
          data: lowestScores,
          smooth: true,
          symbol: 'circle',
          symbolSize: 10,
          lineStyle: {
            width: 3,
            color: '#faad14',
            type: 'dashed'
          },
          itemStyle: {
            color: '#faad14',
            borderColor: '#fff',
            borderWidth: 2
          },
          emphasis: {
            itemStyle: {
              symbolSize: 12,
              color: '#ffc53d'
            }
          },
          animationDelay: (idx: number) => idx * 30 + 300
        }
      ],
      animationEasing: 'elasticOut',
      animationDelayUpdate: (idx: number) => idx * 10
    };

    // 设置图表选项
    chartInstance.current.setOption(option);

    // 响应窗口大小变化
    window.addEventListener('resize', () => {
      chartInstance.current?.resize();
    });
  };

  // 当统计数据加载完成后初始化图表
  useEffect(() => {
    if (workStatistics && workStatistics.length > 0) {
      initChart();
    }

    // 清理函数
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, [workStatistics]);

  return <div ref={chartRef} style={{ height: 500 }} />;
};

export default WorkRatingChart;
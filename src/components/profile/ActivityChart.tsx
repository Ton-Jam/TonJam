import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';

interface DataPoint {
  date: string;
  activity: number;
}

interface ActivityChartProps {
  activities?: Array<{ rawDate?: string; timestamp?: string }>;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ activities = [] }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const chartData = useMemo<DataPoint[]>(() => {
    const countsByDay: Record<string, number> = {};
    activities.forEach((act) => {
      const dateSource = act.rawDate || act.timestamp;
      if (!dateSource) return;
      const parsed = new Date(dateSource);
      if (!Number.isNaN(parsed.getTime())) {
        const key = parsed.toISOString().split('T')[0];
        countsByDay[key] = (countsByDay[key] || 0) + 1;
      }
    });

    const data: DataPoint[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      data.push({
        date: key,
        activity: countsByDay[key] || 0,
      });
    }
    return data;
  }, [activities]);

  useEffect(() => {
    const width = 400;
    const height = 150;
    const margin = { top: 10, right: 10, bottom: 20, left: 30 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const maxActivity = d3.max(chartData, d => d.activity) || 1;

    const x = d3.scaleBand()
      .domain(chartData.map(d => d.date))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, maxActivity])
      .range([height - margin.bottom, margin.top]);

    svg.append('g')
      .attr('fill', '#4f46e5')
      .selectAll('rect')
      .data(chartData)
      .join('rect')
      .attr('x', d => x(d.date)!)
      .attr('y', d => y(d.activity))
      .attr('height', d => y(0) - y(d.activity))
      .attr('width', x.bandwidth());

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickValues(x.domain().filter((_, i) => i % 7 === 0)))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .style('font-size', '10px');

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(4))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .style('font-size', '10px');

  }, [chartData]);

  return (
    <div className="bg-[#101A3B] rounded-[12px] p-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
        Activity (Last 30 Days)
      </h3>
      <svg ref={svgRef} width="400" height="150" viewBox="0 0 400 150" />
    </div>
  );
};

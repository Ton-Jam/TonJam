import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface DataPoint {
  date: string;
  activity: number;
}

const generateMockData = (): DataPoint[] => {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      activity: Math.floor(Math.random() * 20),
    });
  }
  return data;
};

export const ActivityChart: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const data = generateMockData();
    const width = 400;
    const height = 150;
    const margin = { top: 10, right: 10, bottom: 20, left: 30 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const x = d3.scaleBand()
      .domain(data.map(d => d.date))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.activity) || 20])
      .range([height - margin.bottom, margin.top]);

    svg.append('g')
      .attr('fill', '#4f46e5')
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', d => x(d.date)!)
      .attr('y', d => y(d.activity))
      .attr('height', d => y(0) - y(d.activity))
      .attr('width', x.bandwidth());

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickValues(x.domain().filter((d, i) => i % 7 === 0)))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .style('font-size', '10px');

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .style('font-size', '10px');

  }, []);

  return (
    <div className="bg-[#101A3B] border border-white/5 rounded-[12px] p-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
        Activity (Last 30 Days)
      </h3>
      <svg ref={svgRef} width="400" height="150" viewBox="0 0 400 150" />
    </div>
  );
};

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface GenreSalesData {
  genre: string;
  sales: number;
}

interface GenreHeatmapProps {
  data: GenreSalesData[];
  className?: string;
}

const GenreHeatmap: React.FC<GenreHeatmapProps> = ({ data, className }) => {
  const svgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const margin = { top: 20, right: 20, bottom: 40, left: 100 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.genre))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.sales) || 0])
      .range([height, 0]);

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(data, d => d.sales) || 0]);

    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.genre) || 0)
      .attr('y', d => yScale(d.sales))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - yScale(d.sales))
      .attr('fill', d => colorScale(d.sales));

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

  }, [data]);

  return <div className={className} ref={svgRef} />;
};

export default GenreHeatmap;

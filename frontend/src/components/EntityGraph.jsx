import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

const EntityGraph = ({ graphData }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!graphData || !graphData.nodes || !graphData.edges) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const g = svg.append('g');

    const colorScale = {
      SIM: '#1DB87A',
      ACCOUNT: '#E09B20',
      DOMAIN: '#D85A30',
      CLUSTER: '#7F77DD',
    };

    const shapeScale = {
      SIM: 'circle',
      ACCOUNT: 'square',
      DOMAIN: 'diamond',
      CLUSTER: 'circle',
    };

    const sizeScale = (type) => {
      switch (type) {
        case 'CLUSTER': return 20;
        case 'SIM': return 5;
        case 'ACCOUNT': return 6;
        case 'DOMAIN': return 7;
        default: return 5;
      }
    };

    const simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.edges).id(d => d.id).distance(50))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => sizeScale(d.type) + 5));

    const link = g.append('g')
      .selectAll('line')
      .data(graphData.edges)
      .join('line')
      .attr('stroke', '#252830')
      .attr('stroke-width', 1);

    const node = g.append('g')
      .selectAll('g')
      .data(graphData.nodes)
      .join('g')
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    node.append('circle')
      .attr('r', d => sizeScale(d.type))
      .attr('fill', d => colorScale[d.type] || '#888780')
      .attr('stroke', '#252830')
      .attr('stroke-width', 1);

    const tooltip = d3.select('body').append('div')
      .attr('class', 'bg-card border border-border rounded-lg p-3 text-sm pointer-events-none absolute z-50')
      .style('opacity', 0);

    node
      .on('mouseover', (event, d) => {
        tooltip.style('opacity', 1);
        let content = `<strong>${d.type}</strong>`;
        if (d.carrier) content += `<br/>Carrier: ${d.carrier}`;
        if (d.bank) content += `<br/>Bank: ${d.bank}`;
        if (d.url) content += `<br/>Domain: ${d.url}`;
        tooltip.html(content);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
      });

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => {
      tooltip.remove();
    };
  }, [graphData]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full bg-card rounded-2xl border border-border overflow-hidden"
    >
      <svg ref={svgRef} className="w-full h-full" />
    </motion.div>
  );
};

export default EntityGraph;

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';


function getNodeColor(d) {
  switch (d.type) {
    case 'cluster': return '#7F77DD';   // purple — hub
    case 'domain':  return '#D85A30';   // coral — fake portals
    case 'account': return '#E09B20';   // amber — mule accounts
    case 'sim':     return '#1DB87A';   // teal — SIM cards
    default:        return '#888780';   // grey fallback
  }
}


function getNodeRadius(d) {
  switch (d.type) {
    case 'cluster': return 20;
    case 'domain':  return 10;
    case 'account': return 7;
    case 'sim':     return 4;
    default:        return 5;
  }
}


const EntityGraph = ({ graphData }) => {
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!graphData || !graphData.nodes || !graphData.links || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    setDimensions({ width, height });

    const nodes = [...graphData.nodes];
    const links = [...graphData.links];

    // Initialise all nodes at random off-screen positions for the fly-in effect
    nodes.forEach(d => {
      if (d.type !== 'cluster') {
        d.x = (Math.random() - 0.5) * width * 2;
        d.y = (Math.random() - 0.5) * height * 2;
      } else {
        // Hub starts at centre
        d.x = width / 2;
        d.y = height / 2;
        d.fx = width / 2;  // fix hub at centre for first 2 seconds
        d.fy = height / 2;
      }
    });

    // Unfix hub after 2 seconds so it settles naturally
    setTimeout(() => {
      const hubNode = nodes.find(n => n.type === 'cluster');
      if (hubNode) {
        hubNode.fx = null;
        hubNode.fy = null;
      }
    }, 2000);

    const g = svg.append('g');

    const nodeCount = nodes.length;
    const chargeStrength = nodeCount > 100 ? -120 : nodeCount > 50 ? -150 : -200;
    const linkDistance = nodeCount > 100 ? 50 : 70;

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .distance(d => {
          // Hub links pull tightly; proximity edges are loose
          const isHub = (d.target && d.target.type === 'cluster') || (d.source && d.source.type === 'cluster');
          return isHub ? linkDistance : linkDistance * 1.8;
        })
        .strength(d => {
          const isHub = (d.target && d.target.type === 'cluster') || (d.source && d.source.type === 'cluster');
          return isHub ? 0.8 : 0.2;
        })
      )
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => getNodeRadius(d) + 3))
      .force('radial', d3.forceRadial(d => {
        // Hub stays at centre. Domains close in. Accounts mid-ring. SIMs outer ring.
        switch (d.type) {
          case 'cluster': return 0;
          case 'domain':  return Math.min(width, height) * 0.12;
          case 'account': return Math.min(width, height) * 0.22;
          case 'sim':     return Math.min(width, height) * 0.35;
          default:        return Math.min(width, height) * 0.30;
        }
      }, width / 2, height / 2).strength(0.35))
      .alpha(1)
      .alphaDecay(0.015);


    const linkElements = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#252830')
      .attr('stroke-width', d => d.weight * 1.5);


    const nodeElements = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => getNodeRadius(d))
      .attr('fill', d => getNodeColor(d))
      .attr('stroke', d => d.type === 'cluster' ? '#B0A8F8' : 'rgba(255,255,255,0.15)')
      .attr('stroke-width', d => d.type === 'cluster' ? 2 : 0.5);


    const tooltip = d3.select('body').append('div')
      .style('position', 'absolute')
      .style('background', '#191C24')
      .style('border', '1px solid #252830')
      .style('border-radius', '8px')
      .style('padding', '8px 12px')
      .style('font-size', '12px')
      .style('color', '#E8E6E0')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    nodeElements
      .on('mouseover', (event, d) => {
        const content = d.type === 'sim' ? `SIM · ${d.carrier}`
          : d.type === 'account' ? `Account · ${d.bank}`
          : d.type === 'domain' ? `Domain · ${d.url}`
          : 'Campaign hub';
        tooltip.style('opacity', 1).html(content);
      })
      .on('mousemove', event => {
        tooltip.style('left', (event.pageX + 12) + 'px')
          .style('top', (event.pageY - 20) + 'px');
      })
      .on('mouseout', () => tooltip.style('opacity', 0));


    // Legend
    const legendData = [
      { label: 'SIM cards', color: '#1DB87A', shape: 'circle', r: 4 },
      { label: 'Mule accounts', color: '#E09B20', shape: 'circle', r: 7 },
      { label: 'Fake domains', color: '#D85A30', shape: 'circle', r: 10 },
      { label: 'Campaign hub', color: '#7F77DD', shape: 'circle', r: 13 },
    ];

    const legend = svg.append('g')
      .attr('transform', `translate(${width - 160}, ${height - 110})`);

    legendData.forEach((item, i) => {
      const row = legend.append('g').attr('transform', `translate(0, ${i * 24})`);
      row.append('circle')
        .attr('r', item.r / 1.5)
        .attr('cx', 8).attr('cy', 0)
        .attr('fill', item.color)
        .attr('opacity', 0.9);
      row.append('text')
        .attr('x', 20).attr('y', 4)
        .attr('fill', '#888780')
        .attr('font-size', '11px')
        .text(item.label);
    });


    simulation.on('tick', () => {
      linkElements
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      nodeElements
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    });


    return () => {
      simulation.stop();
      tooltip.remove();
    };
  }, [graphData]);


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full rounded-2xl border border-border overflow-hidden"
      style={{ background: '#13151C' }}
    >
      <svg ref={svgRef} className="w-full h-full" />
    </motion.div>
  );
};


export default EntityGraph;

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

    useEffect(() => {
        if (!graphData || !graphData.nodes || !graphData.links || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const W = svgRef.current.clientWidth || 800;
        const H = svgRef.current.clientHeight || 600;

        // Initialise non-hub nodes at random positions just outside the viewport
        graphData.nodes.forEach(d => {
            if (d.type === 'cluster') {
                d.x = W / 2;
                d.y = H / 2;
            } else {
                const angle = Math.random() * 2 * Math.PI;
                const dist = Math.max(W, H) * 0.8;
                d.x = W / 2 + Math.cos(angle) * dist;
                d.y = H / 2 + Math.sin(angle) * dist;
                d.vx = 0;
                d.vy = 0;
            }
        });

        const g = svg.append('g');

        const nodeCount = graphData.nodes.length;
        const chargeStrength = nodeCount > 100 ? -120 : nodeCount > 50 ? -150 : -200;
        const linkDistance = nodeCount > 100 ? 50 : 70;

        const simulation = d3.forceSimulation(graphData.nodes)
            .force('link', d3.forceLink(graphData.links)
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
            .force('center', d3.forceCenter(W / 2, H / 2))
            .force('collision', d3.forceCollide().radius(d => getNodeRadius(d) + 3))
            .force('radial', d3.forceRadial(d => {
                // Hub stays at centre; domains close in; accounts mid-ring; SIMs outer ring
                switch (d.type) {
                    case 'cluster': return 0;
                    case 'domain':  return Math.min(W, H) * 0.12;
                    case 'account': return Math.min(W, H) * 0.22;
                    case 'sim':     return Math.min(W, H) * 0.35;
                    default:        return Math.min(W, H) * 0.30;
                }
            }, W / 2, H / 2).strength(0.35))
            .alpha(1.0)
            .alphaMin(0.001)
            .alphaDecay(0.012)   // slower decay = longer visible animation
            .velocityDecay(0.4);


        const linkElements = g.append('g')
            .selectAll('line')
            .data(graphData.links)
            .join('line')
            .attr('stroke', '#252830')
            .attr('stroke-width', d => d.weight * 1.5);


        const nodeElements = g.append('g')
            .selectAll('circle')
            .data(graphData.nodes)
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
            .attr('transform', `translate(${W - 160}, ${H - 110})`);

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

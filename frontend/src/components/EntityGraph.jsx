import React, { useEffect, useRef } from 'react';
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
        case 'cluster': return 22;
        case 'domain':  return 13;
        case 'account': return 10;
        case 'sim':     return 7;
        default:        return 5;
    }
}


const EntityGraph = ({ graphData }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!graphData?.nodes?.length) return;

        const W = svgRef.current?.clientWidth || 800;
        const H = svgRef.current?.clientHeight || 600;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        // Deep-copy nodes and links so D3 mutation doesn't affect store
        const nodes = graphData.nodes.map(d => ({ ...d }));
        const links = graphData.links.map(d => ({ ...d }));

        // Off-screen init happens HERE, before simulation is created
        nodes.forEach(d => {
            if (d.type === 'cluster') {
                d.x = W / 2;
                d.y = H / 2;
            } else {
                const angle = Math.random() * 2 * Math.PI;
                const dist  = Math.max(W, H) * 0.9;
                d.x = W / 2 + Math.cos(angle) * dist;
                d.y = H / 2 + Math.sin(angle) * dist;
                d.vx = 0;
                d.vy = 0;
            }
        });

        const g = svg.append('g');

        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links)
                .id(d => d.id)
                .distance(55)
                .strength(0.7)
            )
            .force('charge', d3.forceManyBody().strength(-100))
            .force('center', d3.forceCenter(W / 2, H / 2))
            .force('collision', d3.forceCollide().radius(d => getNodeRadius(d) + 3))
            .force('radial', d3.forceRadial(d => {
                const R = Math.min(W, H) * 0.42;
                switch (d.type) {
                    case 'cluster': return 0;
                    case 'domain':  return R * 0.28;
                    case 'account': return R * 0.55;
                    default:        return R;
                }
            }, W / 2, H / 2).strength(0.4))
            .alpha(1.0)
            .alphaMin(0.001)
            .alphaDecay(0.003) // much slower decay for dramatic animation
            .velocityDecay(0.35);

        const linkElements = g.append('g')
            .selectAll('line')
            .data(links)
            .join('line')
            .attr('stroke', '#252830')
            .attr('stroke-width', d => d.weight ? d.weight * 1.5 : 1);

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
                const content = d.type === 'sim' ? `SIM · ${d.carrier || 'Unknown'}`
                    : d.type === 'account' ? `Account · ${d.bank || 'Unknown'}`
                    : d.type === 'domain' ? `Domain · ${d.url || 'Unknown'}`
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
            { label: 'SIM cards', color: '#1DB87A', r: 7 },
            { label: 'Mule accounts', color: '#E09B20', r: 10 },
            { label: 'Fake domains', color: '#D85A30', r: 13 },
            { label: 'Campaign hub', color: '#7F77DD', r: 16 },
        ];

        const legend = svg.append('g')
            .attr('transform', `translate(${W - 170}, ${H - 120})`);

        legendData.forEach((item, i) => {
            const row = legend.append('g').attr('transform', `translate(0, ${i * 24})`);
            row.append('circle')
                .attr('r', item.r / 2)
                .attr('cx', 8)
                .attr('cy', 0)
                .attr('fill', item.color)
                .attr('opacity', 0.9);
            row.append('text')
                .attr('x', 20)
                .attr('y', 4)
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

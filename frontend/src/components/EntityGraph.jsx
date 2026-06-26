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
        case 'cluster': return 20;
        case 'domain':  return 10;
        case 'account': return 7;
        case 'sim':     return 4;
        default:        return 5;
    }
}


function getTooltipContent(d) {
    if (d.type === 'cluster')  return `<b>Campaign hub</b>`;
    if (d.type === 'sim')      return `SIM card<br/><span style="color:#888">${d.carrier || ''}</span>`;
    if (d.type === 'account')  return `Mule account<br/><span style="color:#888">${d.bank || ''}</span>`;
    if (d.type === 'domain')   return `Fake domain<br/><span style="color:#888">${d.url || ''}</span>`;
    return d.type;
}


const EntityGraph = ({ graphData }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!graphData?.nodes?.length) return;

        const W = svgRef.current?.clientWidth || 800;
        const H = svgRef.current?.clientHeight || 600;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();


        // --- STEP 1: DARK BACKGROUND & GRID ---
        // Dark background
        svg.append('rect')
            .attr('width', W).attr('height', H)
            .attr('fill', '#0D0F14')
            .attr('rx', 12);

        // Subtle grid lines
        const gridGroup = svg.append('g').attr('opacity', 0.04);
        for (let x = 0; x < W; x += 40) {
            gridGroup.append('line')
                .attr('x1', x).attr('y1', 0)
                .attr('x2', x).attr('y2', H)
                .attr('stroke', '#FFFFFF').attr('stroke-width', 0.5);
        }
        for (let y = 0; y < H; y += 40) {
            gridGroup.append('line')
                .attr('x1', 0).attr('y1', y)
                .attr('x2', W).attr('y2', y)
                .attr('stroke', '#FFFFFF').attr('stroke-width', 0.5);
        }


        // --- STEP 2: SVG GLOW FILTERS ---
        const defs = svg.append('defs');

        // Glow filter factory
        const makeGlow = (id, color, blur = 4, opacity = 0.8) => {
            const f = defs.append('filter')
                .attr('id', id)
                .attr('x', '-50%').attr('y', '-50%')
                .attr('width', '200%').attr('height', '200%');
            f.append('feGaussianBlur')
                .attr('in', 'SourceGraphic')
                .attr('stdDeviation', blur)
                .attr('result', 'blur');
            const merge = f.append('feMerge');
            merge.append('feMergeNode').attr('in', 'blur');
            merge.append('feMergeNode').attr('in', 'SourceGraphic');
        };

        makeGlow('glow-hub',     '#7F77DD', 8,  0.9);
        makeGlow('glow-sim',     '#1DB87A', 3,  0.7);
        makeGlow('glow-account', '#E09B20', 4,  0.7);
        makeGlow('glow-domain',  '#D85A30', 5,  0.8);
        makeGlow('glow-edge',    '#FFFFFF', 1,  0.3);


        // --- STEP 3: BOOT SCAN LINE ---
        const scanLine = svg.append('line')
            .attr('x1', 0).attr('x2', W)
            .attr('y1', 0).attr('y2', 0)
            .attr('stroke', 'rgba(100,200,255,0.25)')
            .attr('stroke-width', 1.5);

        scanLine.transition()
            .duration(700)
            .ease(d3.easeLinear)
            .attr('y1', H).attr('y2', H)
            .on('end', () => scanLine.remove());


        // --- STEP 4: PREPARE DATA & SIMULATION ---
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


        // --- STEP 5: DRAW EDGES WITH BEAM ANIMATION ---
        const linkGroup = svg.append('g').attr('class', 'links');

        const linkElements = linkGroup.selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('stroke', d => {
                const nonHub = (d.source.type !== 'cluster' && d.source.type)
                    || (d.target.type !== 'cluster' && d.target.type);
                if (nonHub === 'domain')  return 'rgba(216,90,48,0.25)';
                if (nonHub === 'account') return 'rgba(224,155,32,0.2)';
                return 'rgba(29,184,122,0.15)';
            })
            .attr('stroke-width', 0.8)
            .attr('filter', 'url(#glow-edge)')
            // Start invisible — the tick handler will set positions
            .attr('opacity', 0);

        // Fade edges in staggered after 800ms (after scan line finishes)
        linkElements.transition()
            .delay((_, i) => 800 + i * 2)   // stagger 2ms per edge
            .duration(400)
            .attr('opacity', 1);


        // --- STEP 6: NODE GROUP WITH OBSIDIAN APPEARANCE ---
        const nodeGroup = svg.append('g').attr('class', 'nodes');

        const nodeElements = nodeGroup.selectAll('g.node-item')
            .data(nodes)
            .enter().append('g')
            .attr('class', 'node-item')
            .style('cursor', 'pointer');

        // Outer glow ring (large, faint, animated)
        nodeElements.append('circle')
            .attr('class', 'glow-ring')
            .attr('r', d => getNodeRadius(d) * 3)
            .attr('fill', 'none')
            .attr('stroke', d => getNodeColor(d))
            .attr('stroke-width', 1)
            .attr('opacity', 0)
            .attr('filter', d => `url(#glow-${d.type === 'cluster' ? 'hub' :
                                               d.type === 'sim'     ? 'sim' :
                                               d.type === 'account' ? 'account' : 'domain'})`);

        // Mid ring (slightly smaller, more visible)
        nodeElements.append('circle')
            .attr('class', 'mid-ring')
            .attr('r', d => getNodeRadius(d) * 1.7)
            .attr('fill', 'none')
            .attr('stroke', d => getNodeColor(d))
            .attr('stroke-width', 0.5)
            .attr('opacity', 0);

        // Core dot
        nodeElements.append('circle')
            .attr('class', 'core')
            .attr('r', d => getNodeRadius(d))
            .attr('fill', d => getNodeColor(d))
            .attr('stroke', '#0A0B0F')
            .attr('stroke-width', d => d.type === 'cluster' ? 2 : 1)
            .attr('opacity', 0)
            .attr('filter', d => d.type === 'cluster' ? 'url(#glow-hub)' : null);

        // Animate each node appearing with stagger based on distance from hub
        const typeOrder = { cluster: 0, domain: 1, account: 2, sim: 3 };
        const baseDelay = 900;  // after scan line

        nodeElements.each(function(d, i) {
            const el = d3.select(this);
            const order = typeOrder[d.type] ?? 3;
            const delay = baseDelay + order * 150 + (i * 3);

            // Core appears first
            el.select('.core')
                .transition().delay(delay).duration(300)
                .attr('opacity', 1);

            // Mid ring blooms outward
            el.select('.mid-ring')
                .transition().delay(delay + 50).duration(500)
                .attr('opacity', 0.4)
                .attr('r', d => getNodeRadius(d) * 2.2);

            // Glow ring expands and fades
            el.select('.glow-ring')
                .transition().delay(delay).duration(800)
                .attr('opacity', 0.15)
                .attr('r', d => getNodeRadius(d) * 4);
        });


        // --- STEP 7: HUB BREATHING PULSE ---
        function pulseHub() {
            const hubEl = nodeElements.filter(d => d.type === 'cluster');

            hubEl.select('.glow-ring')
                .transition()
                .duration(1800)
                .ease(d3.easeSinInOut)
                .attr('opacity', 0.35)
                .attr('r', 52)
                .transition()
                .duration(1800)
                .ease(d3.easeSinInOut)
                .attr('opacity', 0.08)
                .attr('r', 36)
                .on('end', pulseHub);   // loop forever
        }

        // Start pulse after hub has appeared
        setTimeout(pulseHub, baseDelay + 600);


        // --- STEP 8: TICK HANDLER ---
        simulation.on('tick', () => {
            linkElements
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            nodeElements
                .attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`);
        });


        // --- STEP 9: TOOLTIP AND DRAG ---
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
                // Brighten glow on hover
                d3.select(event.currentTarget).select('.core')
                    .transition().duration(150)
                    .attr('r', getNodeRadius(d) * 1.4);
                d3.select(event.currentTarget).select('.glow-ring')
                    .transition().duration(150)
                    .attr('opacity', 0.5);
                // Show tooltip
                tooltip.style('opacity', 1)
                    .html(getTooltipContent(d));
            })
            .on('mousemove', event => {
                tooltip
                    .style('left', (event.pageX + 14) + 'px')
                    .style('top',  (event.pageY - 18) + 'px');
            })
            .on('mouseout', (event, d) => {
                d3.select(event.currentTarget).select('.core')
                    .transition().duration(200)
                    .attr('r', getNodeRadius(d));
                d3.select(event.currentTarget).select('.glow-ring')
                    .transition().duration(200)
                    .attr('opacity', d.type === 'cluster' ? 0.15 : 0.12);
                tooltip.style('opacity', 0);
            })
            .call(d3.drag()
                .on('start', (event, d) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x; d.fy = d.y;
                })
                .on('drag', (event, d) => {
                    d.fx = event.x; d.fy = event.y;
                })
                .on('end', (event, d) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null; d.fy = null;
                })
            );


        // --- STEP 10: LEGEND ---
        const legendData = [
            { label: 'SIM cards', color: '#1DB87A', r: 4 },
            { label: 'Mule accounts', color: '#E09B20', r: 7 },
            { label: 'Fake domains', color: '#D85A30', r: 10 },
            { label: 'Campaign hub', color: '#7F77DD', r: 13 },
        ];

        const legend = svg.append('g')
            .attr('transform', `translate(${W - 170}, ${H - 120})`);

        legendData.forEach((item, i) => {
            const row = legend.append('g').attr('transform', `translate(0, ${i * 24})`);
            row.append('circle')
                .attr('r', item.r / 1.5)
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


        // --- CLEANUP ---
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
        >
            <svg ref={svgRef} className="w-full h-full" />
        </motion.div>
    );
};


export default EntityGraph;

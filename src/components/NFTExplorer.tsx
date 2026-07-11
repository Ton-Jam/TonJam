import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Maximize2 } from 'lucide-react';
import { Collection } from '@/types';

interface BubbleNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  creator: string;
  coverUrl: string;
  totalVolume: number;
  floorPrice: string;
  radius: number;
}

export const NFTExplorer: React.FC = () => {
  const [collections, setCollections] = useState<BubbleNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<BubbleNode | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const collectionsRef = collection(db, 'collections');
        // Fetch up to 20 collections for the visualization
        const q = query(collectionsRef, limit(20));
        const snapshot = await getDocs(q);
        
        const fetched: BubbleNode[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const volume = parseFloat(data.totalVolume || '0') || Math.random() * 5000 + 100; // random fallback if missing
          fetched.push({
            id: doc.id,
            name: data.name || 'Unknown Collection',
            creator: data.creator || 'Unknown',
            coverUrl: data.coverUrl || '',
            totalVolume: volume,
            floorPrice: data.floorPrice || '0',
            radius: 0 // Will be calculated
          });
        });

        // If no data, use some fallback mock data
        if (fetched.length === 0) {
          const mockData = [
            { id: '1', name: 'Sonic Origins', creator: 'AudioPunks', totalVolume: 12500, floorPrice: '15.5', coverUrl: 'https://images.unsplash.com/photo-1614113489855-66422ad300a4?w=400&q=80' },
            { id: '2', name: 'Ambient Dreams', creator: 'LoFi Beats', totalVolume: 8200, floorPrice: '4.2', coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80' },
            { id: '3', name: 'Cyberpunk Synths', creator: 'Neon Riot', totalVolume: 18400, floorPrice: '25.0', coverUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&q=80' },
            { id: '4', name: 'Acoustic Sessions', creator: 'John Doe', totalVolume: 3500, floorPrice: '2.1', coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=80' },
            { id: '5', name: 'Bass Drops', creator: 'DJ Max', totalVolume: 9100, floorPrice: '8.8', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
            { id: '6', name: 'Vinyl Classics', creator: 'Retro', totalVolume: 6700, floorPrice: '5.0', coverUrl: 'https://images.unsplash.com/photo-1460036521480-ff49c08c2781?w=400&q=80' },
            { id: '7', name: 'Vaporwave Vol. 1', creator: 'Aesthetic', totalVolume: 10200, floorPrice: '12.0', coverUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80' },
            { id: '8', name: 'Techno Underground', creator: 'Underground', totalVolume: 5300, floorPrice: '3.5', coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80' }
          ];
          mockData.forEach(item => {
            fetched.push({
              ...item,
              radius: 0
            });
          });
        }
        
        // Calculate radiuses based on volume
        const maxVolume = d3.max(fetched, d => d.totalVolume) || 1;
        const minVolume = d3.min(fetched, d => d.totalVolume) || 0;
        
        const radiusScale = d3.scaleSqrt()
          .domain([minVolume, maxVolume])
          .range([30, 80]); // Min and max bubble sizes
          
        fetched.forEach(d => {
          d.radius = radiusScale(d.totalVolume);
        });

        setCollections(fetched);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'collections');
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  useEffect(() => {
    if (!collections.length || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 400; // Fixed height for the visualization
    
    // Clear previous SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto; display: block;');

    // Add a definitions block for clipping masks
    const defs = svg.append("defs");
    
    // Setup D3 simulation
    const simulation = d3.forceSimulation(collections)
      .force('charge', d3.forceManyBody().strength(5))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius + 2).iterations(4))
      .on('tick', ticked);

    const nodeGroup = svg.append('g');

    // Create groups for each node
    const nodes = nodeGroup.selectAll('.node')
      .data(collections)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedCollection(d);
        // Add a gentle bump effect
        d.fx = d.x;
        d.fy = d.y;
        d3.select(event.currentTarget).select('circle.bg')
          .transition().duration(150)
          .attr('r', d.radius * 1.1)
          .transition().duration(150)
          .attr('r', d.radius);
          
        setTimeout(() => {
           d.fx = null;
           d.fy = null;
        }, 500);
      });

    // Create clipping masks for each image
    nodes.each(function(d) {
      defs.append("clipPath")
        .attr("id", `clip-${d.id}`)
        .append("circle")
        .attr("r", d.radius);
    });

    // Draw backgrounds (image or color)
    nodes.append('circle')
      .attr('class', 'bg')
      .attr('r', d => d.radius)
      .style('fill', '#1e293b') // fallback color
      .style('stroke', 'rgba(59, 130, 246, 0.5)')
      .style('stroke-width', 2);

    // Draw images
    nodes.append('image')
      .attr('xlink:href', d => d.coverUrl)
      .attr('x', d => -d.radius)
      .attr('y', d => -d.radius)
      .attr('width', d => d.radius * 2)
      .attr('height', d => d.radius * 2)
      .attr('clip-path', d => `url(#clip-${d.id})`)
      .style('opacity', 0.6)
      .on('mouseover', function() {
        d3.select(this).transition().duration(300).style('opacity', 0.9);
      })
      .on('mouseout', function() {
        d3.select(this).transition().duration(300).style('opacity', 0.6);
      });

    // Dark gradient overlay to make text readable
    nodes.append('circle')
      .attr('r', d => d.radius)
      .style('fill', 'url(#gradient-overlay)')
      .style('pointer-events', 'none');

    // Add a reusable gradient
    const gradient = defs.append('radialGradient')
      .attr('id', 'gradient-overlay')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');
    gradient.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(0,0,0,0.1)');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(0,0,0,0.8)');

    // Add text (name)
    nodes.append('text')
      .text(d => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .style('fill', 'white')
      .style('font-size', d => Math.min(12, d.radius / 3) + 'px')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .each(function(d) {
         // Truncate text if it's wider than the bubble
         const el = d3.select(this).node() as SVGTextElement;
         let text = d.name;
         while (el.getComputedTextLength() > (d.radius * 2 - 10) && text.length > 0) {
           text = text.slice(0, -1);
           d3.select(this).text(text + '...');
         }
      });

    // Add text (volume)
    nodes.append('text')
      .text(d => `${d.totalVolume.toLocaleString()} TON`)
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .style('fill', '#38bdf8') // cyan-400
      .style('font-size', d => Math.min(10, d.radius / 4) + 'px')
      .style('font-weight', 'bold')
      .style('font-family', 'monospace')
      .style('pointer-events', 'none');

    // Add drag behavior
    const drag = d3.drag<SVGGElement, BubbleNode>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
    
    nodes.call(drag);

    function ticked() {
      // Keep nodes within the container bounds
      nodes.attr('transform', d => {
        d.x = Math.max(d.radius, Math.min(width - d.radius, d.x!));
        d.y = Math.max(d.radius, Math.min(height - d.radius, d.y!));
        return `translate(${d.x},${d.y})`;
      });
    }

    function dragstarted(event: any, d: BubbleNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event: any, d: BubbleNode) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event: any, d: BubbleNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Add Resize Observer to handle window resizing
    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0 || !entries[0]) return;
      const newWidth = entries[0].contentRect.width;
      svg.attr('width', newWidth).attr('viewBox', [0, 0, newWidth, height]);
      simulation.force('center', d3.forceCenter(newWidth / 2, height / 2));
      simulation.alpha(0.3).restart();
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => {
      simulation.stop();
      resizeObserver.disconnect();
    };
  }, [collections]);

  return (
    <div className="bg-[#0A1128] rounded-2xl p-6 border border-white/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 relative z-10">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            NFT Collection Explorer
            <Maximize2 className="w-4 h-4 text-slate-400" />
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Trending by total trading volume. Drag to interact, tap for details.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="w-full h-[400px] flex items-center justify-center relative z-10">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="relative w-full h-[400px] z-10" ref={containerRef}>
          <svg ref={svgRef} className="w-full h-full" />
          
          {/* Details Tooltip / Card */}
          {selectedCollection && (
            <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl animate-fade-in z-20">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={selectedCollection.coverUrl} 
                    alt={selectedCollection.name} 
                    className="w-10 h-10 rounded-lg object-cover bg-slate-800"
                  />
                  <div>
                    <h4 className="text-white font-bold text-sm leading-tight">{selectedCollection.name}</h4>
                    <p className="text-slate-400 text-xs">by {selectedCollection.creator}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCollection(null)}
                  className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors"
                >
                  &times;
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Volume</div>
                  <div className="text-sm font-mono text-cyan-400 font-bold">{selectedCollection.totalVolume.toLocaleString()} TON</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Floor</div>
                  <div className="text-sm font-mono text-emerald-400 font-bold">{selectedCollection.floorPrice} TON</div>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/marketplace')}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                View Collection <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NFTExplorer;

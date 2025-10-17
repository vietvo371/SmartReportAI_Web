'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxMapProps {
  className?: string;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ className = '' }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (map.current) return; // initialize map only once

    // You'll need to add your Mapbox access token to environment variables
    // Get your free token from: https://account.mapbox.com/access-tokens/
    const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [105.8342, 21.0278], // Hanoi, Vietnam
      zoom: 10,
      pitch: 45,
      bearing: -17.6,
      antialias: true
    });

    map.current.on('load', () => {
      setIsLoaded(true);
      
      if (!map.current) return;

      // Add infrastructure issues
      map.current.addSource('infrastructure-issues', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                name: 'Ổ gà đường Nguyễn Huệ',
                type: 'pothole',
                priority: 'high',
                status: 'pending',
                reportedBy: 'Nguyễn Văn A',
                reportedAt: '2025-01-15T08:30:00Z'
              },
              geometry: {
                type: 'Point',
                coordinates: [105.7842, 21.0278]
              }
            },
            {
              type: 'Feature',
              properties: {
                name: 'Ngập lụt khu vực Cầu Giấy',
                type: 'flooding',
                priority: 'critical',
                status: 'in-progress',
                reportedBy: 'Trần Thị B',
                reportedAt: '2025-01-15T09:15:00Z'
              },
              geometry: {
                type: 'Point',
                coordinates: [105.8842, 21.1278]
              }
            },
            {
              type: 'Feature',
              properties: {
                name: 'Đèn giao thông hỏng',
                type: 'traffic-light',
                priority: 'medium',
                status: 'resolved',
                reportedBy: 'Lê Văn C',
                reportedAt: '2025-01-14T16:45:00Z'
              },
              geometry: {
                type: 'Point',
                coordinates: [105.7342, 20.9278]
              }
            },
            {
              type: 'Feature',
              properties: {
                name: 'Rác thải tập trung',
                type: 'waste',
                priority: 'low',
                status: 'pending',
                reportedBy: 'Phạm Thị D',
                reportedAt: '2025-01-15T10:20:00Z'
              },
              geometry: {
                type: 'Point',
                coordinates: [105.8142, 21.0478]
              }
            },
            {
              type: 'Feature',
              properties: {
                name: 'Kẹt xe tại ngã tư',
                type: 'traffic-jam',
                priority: 'high',
                status: 'in-progress',
                reportedBy: 'Hoàng Văn E',
                reportedAt: '2025-01-15T07:30:00Z'
              },
              geometry: {
                type: 'Point',
                coordinates: [105.9042, 21.1078]
              }
            }
          ]
        }
      });

      // Add processing teams
      map.current.addSource('processing-teams', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                name: 'Đội xử lý 1',
                type: 'processing-team',
                status: 'active',
                currentTask: 'Xử lý ngập lụt Cầu Giấy'
              },
              geometry: {
                type: 'Point',
                coordinates: [105.7542, 20.9478]
              }
            },
            {
              type: 'Feature',
              properties: {
                name: 'Đội xử lý 2',
                type: 'processing-team',
                status: 'active',
                currentTask: 'Sửa chữa đèn giao thông'
              },
              geometry: {
                type: 'Point',
                coordinates: [105.8642, 20.9878]
              }
            },
            {
              type: 'Feature',
              properties: {
                name: 'Đội xử lý 3',
                type: 'processing-team',
                status: 'standby',
                currentTask: 'Sẵn sàng xử lý'
              },
              geometry: {
                type: 'Point',
                coordinates: [105.7942, 21.0678]
              }
            }
          ]
        }
      });

      // Add infrastructure issues layer
      map.current.addLayer({
        id: 'infrastructure-issues',
        type: 'circle',
        source: 'infrastructure-issues',
        paint: {
          'circle-radius': [
            'case',
            ['==', ['get', 'priority'], 'critical'], 14,
            ['==', ['get', 'priority'], 'high'], 12,
            ['==', ['get', 'priority'], 'medium'], 10,
            8
          ],
          'circle-color': [
            'case',
            ['==', ['get', 'priority'], 'critical'], '#DC2626',
            ['==', ['get', 'priority'], 'high'], '#EF4444',
            ['==', ['get', 'priority'], 'medium'], '#F59E0B',
            '#6B7280'
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9
        }
      });

      // Add processing teams layer
      map.current.addLayer({
        id: 'processing-teams',
        type: 'circle',
        source: 'processing-teams',
        paint: {
          'circle-radius': 10,
          'circle-color': [
            'case',
            ['==', ['get', 'status'], 'active'], '#3a5ba0',
            ['==', ['get', 'status'], 'standby'], '#10B981',
            '#6B7280'
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.8
        }
      });

      // Add pulsing animation for critical issues
      map.current.addLayer({
        id: 'critical-issues-pulse',
        type: 'circle',
        source: 'infrastructure-issues',
        filter: ['==', ['get', 'priority'], 'critical'],
        paint: {
          'circle-radius': {
            'base': 14,
            'stops': [[0, 14], [20, 24]]
          },
          'circle-color': '#DC2626',
          'circle-opacity': 0.3
        }
      });

      // Add pulsing animation for processing teams
      map.current.addLayer({
        id: 'processing-teams-pulse',
        type: 'circle',
        source: 'processing-teams',
        paint: {
          'circle-radius': {
            'base': 10,
            'stops': [[0, 10], [20, 18]]
          },
          'circle-color': '#3a5ba0',
          'circle-opacity': 0.2
        }
      });

      // Add popup on click for infrastructure issues
      map.current.on('click', 'infrastructure-issues', (e) => {
        const coordinates = e.lngLat;
        const properties = e.features?.[0]?.properties;
        
        if (map.current) {
          const priorityColors = {
            'critical': '#DC2626',
            'high': '#EF4444',
            'medium': '#F59E0B',
            'low': '#6B7280'
          };
          
          const statusText = {
            'pending': 'Chờ xử lý',
            'in-progress': 'Đang xử lý',
            'resolved': 'Đã giải quyết'
          };
          
          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div class="p-3 min-w-[200px]">
                <h3 class="font-semibold text-gray-800 mb-2">${properties?.name}</h3>
                <div class="space-y-1 text-sm">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" style="background-color: ${priorityColors[properties?.priority]}"></span>
                    <span class="text-gray-600">Ưu tiên: ${properties?.priority}</span>
                  </div>
                  <div class="text-gray-600">Trạng thái: ${statusText[properties?.status]}</div>
                  <div class="text-gray-600">Báo cáo bởi: ${properties?.reportedBy}</div>
                  <div class="text-gray-500 text-xs">${new Date(properties?.reportedAt).toLocaleString('vi-VN')}</div>
                </div>
              </div>
            `)
            .addTo(map.current);
        }
      });

      map.current.on('click', 'processing-teams', (e) => {
        const coordinates = e.lngLat;
        const properties = e.features?.[0]?.properties;
        
        if (map.current) {
          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div class="p-3 min-w-[200px]">
                <h3 class="font-semibold text-blue-600 mb-2">${properties?.name}</h3>
                <div class="space-y-1 text-sm">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full ${properties?.status === 'active' ? 'bg-blue-500' : 'bg-green-500'}"></span>
                    <span class="text-gray-600">Trạng thái: ${properties?.status === 'active' ? 'Đang hoạt động' : 'Sẵn sàng'}</span>
                  </div>
                  <div class="text-gray-600">Nhiệm vụ: ${properties?.currentTask}</div>
                </div>
              </div>
            `)
            .addTo(map.current);
        }
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'infrastructure-issues', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseenter', 'processing-teams', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'infrastructure-issues', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });

      map.current.on('mouseleave', 'processing-teams', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {/* Overlay UI */}
      {isLoaded && (
        <>
          {/* Status Panel */}
          <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Tình trạng hạ tầng</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">1 Khẩn cấp</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">2 Cao</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">2 Đã xử lý</span>
              </div>
            </div>
          </div>

          {/* Live Stats */}
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Hiệu quả xử lý</div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">85%</div>
            <div className="text-xs text-gray-500">Trung bình 2.3h</div>
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Chú thích</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Sự cố khẩn cấp</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Ưu tiên cao</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Đội xử lý</span>
              </div>
            </div>
          </div>

          {/* AI Processing Badge */}
          <div className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              AI Đang phân tích
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MapboxMap;

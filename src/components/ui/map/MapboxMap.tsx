'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Report } from '@/types/report';

interface MapboxMapProps {
  className?: string;
  reports?: Report[];
}

const MapboxMap: React.FC<MapboxMapProps> = ({ className = '', reports = [] }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Helper function to convert reports to GeoJSON features
  const convertReportsToFeatures = (reports: Report[]) => {
    return reports.map((report) => {
      const getPriority = (mucDo: number) => {
        if (mucDo >= 4) return 'critical';
        if (mucDo >= 3) return 'high';
        if (mucDo >= 2) return 'medium';
        return 'low';
      };

      const getStatus = (trangThai: string) => {
        switch (trangThai) {
          case 'cho_xu_ly': return 'pending';
          case 'dang_xu_ly': return 'in-progress';
          case 'da_hoan_tat': return 'resolved';
          default: return 'pending';
        }
      };

      return {
        type: 'Feature' as const,
        properties: {
          id: report.id,
          name: report.tieu_de,
          type: report.loai_su_co,
          priority: getPriority(report.muc_do_nghiem_trong),
          status: getStatus(report.trang_thai),
          reportedBy: report.nguoi_dung?.ho_ten || 'Không xác định',
          reportedAt: report.created_at,
          description: report.mo_ta || '',
          muc_do: report.muc_do_nghiem_trong
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [report.kinh_do, report.vi_do]
        }
      };
    });
  };

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [108.1654204, 16.0472473], // Hanoi, Vietnam
      zoom: 10,
      pitch: 45,
      bearing: -17.6,
      antialias: true
    });

    map.current.on('load', () => {
      setIsLoaded(true);
      
      if (!map.current) return;

      const features = convertReportsToFeatures(reports);

      // Add infrastructure issues
      map.current.addSource('infrastructure-issues', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: features
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
            ['>=', ['get', 'muc_do'], 4], 14,  // Khẩn cấp
            ['==', ['get', 'muc_do'], 3], 12,  // Ưu tiên cao
            ['==', ['get', 'muc_do'], 2], 10,  // Ưu tiên trung bình
            8  // Ưu tiên thấp
          ],
          'circle-color': [
            'case',
            ['>=', ['get', 'muc_do'], 4], '#DC2626',  // Khẩn cấp - đỏ
            ['==', ['get', 'muc_do'], 3], '#F97316',  // Ưu tiên cao - cam
            ['==', ['get', 'muc_do'], 2], '#EAB308',  // Ưu tiên trung bình - vàng
            '#6B7280'  // Ưu tiên thấp - xám
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
        filter: ['>=', ['get', 'muc_do'], 4],
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
          const getPriorityColor = (mucDo: number) => {
            if (mucDo >= 4) return '#DC2626';  // Khẩn cấp - đỏ
            if (mucDo === 3) return '#F97316';  // Ưu tiên cao - cam
            if (mucDo === 2) return '#EAB308';  // Ưu tiên trung bình - vàng
            return '#6B7280';  // Ưu tiên thấp - xám
          };

          const getPriorityText = (mucDo: number) => {
            if (mucDo >= 4) return 'Khẩn cấp';
            if (mucDo === 3) return 'Ưu tiên cao';
            if (mucDo === 2) return 'Ưu tiên trung bình';
            return 'Ưu tiên thấp';
          };
          
          const statusText: Record<string, string> = {
            'pending': 'Chờ xử lý',
            'in-progress': 'Đang xử lý',
            'resolved': 'Đã giải quyết'
          };
          
          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div class="p-3 min-w-[250px]">
                <h3 class="font-semibold text-gray-800 mb-2">${properties?.name}</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" style="background-color: ${getPriorityColor(properties?.muc_do || 1)}"></span>
                    <span class="text-gray-600">Mức độ: ${getPriorityText(properties?.muc_do || 1)} (${properties?.muc_do}/5)</span>
                  </div>
                  <div class="text-gray-600">Loại sự cố: ${properties?.type}</div>
                  <div class="text-gray-600">Trạng thái: ${statusText[properties?.status as string] || 'Không xác định'}</div>
                  <div class="text-gray-600">Báo cáo bởi: ${properties?.reportedBy}</div>
                  ${properties?.description ? `<div class="text-gray-500 text-xs mt-2 p-2 bg-gray-50 rounded">${properties?.description}</div>` : ''}
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
        map.current = null;
      }
    };
  }, []);

  // Update map data when reports change
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const features = convertReportsToFeatures(reports);

    // Update the data source
    const source = map.current.getSource('infrastructure-issues') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: features
      });
    }
  }, [reports, isLoaded]);

  // Handle map resize when container size changes
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const handleResize = () => {
      if (map.current) {
        map.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isLoaded]);

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
                <div className={`w-3 h-3 bg-red-500 rounded-full ${reports.filter(r => r.muc_do_nghiem_trong >= 4).length > 0 ? 'animate-pulse' : ''}`}></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">{reports.filter(r => r.muc_do_nghiem_trong >= 4).length} Khẩn cấp</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">{reports.filter(r => r.muc_do_nghiem_trong === 3).length} Ưu tiên cao</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">{reports.filter(r => r.muc_do_nghiem_trong === 2).length} Ưu tiên trung bình</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">{reports.filter(r => r.muc_do_nghiem_trong === 1).length} Ưu tiên thấp</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">{reports.filter(r => r.trang_thai === 'da_hoan_tat').length} Đã xử lý</span>
              </div>
            </div>
          </div>

          {/* Live Stats */}
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Hiệu quả xử lý</div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {reports.length > 0 ? Math.round((reports.filter(r => r.trang_thai === 'da_hoan_tat').length / reports.length) * 100) : 0}%
            </div>
            <div className="text-xs text-gray-500">
              {reports.length} tổng cộng
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
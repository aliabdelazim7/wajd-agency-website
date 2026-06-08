import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';

export default function ScriptInjector() {
  const location = useLocation();
  const injectedElementsRef = useRef([]);
  const scriptsLoadedRef = useRef(false);

  function cleanupScripts() {
    injectedElementsRef.current.forEach((el) => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
    injectedElementsRef.current = [];
  }

  function getContainer(placement) {
    switch (placement) {
      case 'head':
        return document.head;
      case 'body_start':
      case 'body_end':
        return document.body;
      default:
        console.warn(`ScriptInjector: unknown placement value '${placement}'. Script not injected.`);
        return null;
    }
  }

  function injectScript(script) {
    const { script_code, placement } = script;
    
    // Create a temporary container to parse the HTML string
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = script_code;
    
    const children = Array.from(tempDiv.childNodes);
    const targetContainer = getContainer(placement);
    
    if (!targetContainer) return;
    
    children.forEach((node) => {
      try {
        let elementToInject = node;
        
        // If it's a script tag, create a new script tag so it executes
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === 'script') {
          elementToInject = document.createElement('script');
          
          // Copy all attributes
          Array.from(node.attributes).forEach((attr) => {
            elementToInject.setAttribute(attr.name, attr.value);
          });
          
          // Copy text content
          elementToInject.textContent = node.textContent;
        }
        
        // Inject to appropriate location
        if (placement === 'body_start') {
          // Insert at the very beginning of body
          if (targetContainer.firstChild) {
            targetContainer.insertBefore(elementToInject, targetContainer.firstChild);
          } else {
            targetContainer.appendChild(elementToInject);
          }
        } else {
          // Appends to head or end of body
          targetContainer.appendChild(elementToInject);
        }
        
        // Save reference for cleanup
        injectedElementsRef.current.push(elementToInject);
      } catch (nodeErr) {
        console.error(`Failed to inject script element for ${script.name}:`, nodeErr);
      }
    });
  }

  useEffect(() => {
    try {
      if (location.pathname.startsWith('/admin')) {
        cleanupScripts();
        scriptsLoadedRef.current = false;
        console.warn(
          '%c⚠️ أمن البيانات: تحذير لوحة التحكم الإدارية! لا تقم بلصق أي أكواد برمجية هنا لا تثق بها، فقد يتسبب ذلك في سرقة حسابك أو بياناتك.',
          'color: #ef4444; font-size: 14px; font-weight: bold; font-family: sans-serif;'
        );
        return;
      }

      // If scripts are already loaded for the public site, don't load them again
      if (scriptsLoadedRef.current) {
        return;
      }

      let isMounted = true;

      // Fetch active scripts
      api.scripts.getAllActive()
        .then((scripts) => {
          if (!isMounted) return;

          // Clean up any previously injected elements first
          cleanupScripts();

          scripts.forEach((script) => {
            try {
              injectScript(script);
            } catch (err) {
              console.error(`Failed to inject script: ${script.name}`, err);
            }
          });
          scriptsLoadedRef.current = true;
        })
        .catch((err) => {
          console.warn('Failed to load tracking scripts:', err);
        });

      return () => {
        isMounted = false;
      };
    } catch (e) {
      console.error('Unexpected error in ScriptInjector useEffect:', e);
    }
  }, [location.pathname]);

  // Clean up scripts only when component unmounts completely
  useEffect(() => {
    return () => {
      cleanupScripts();
    };
  }, []);

  return null; // Silent component
}

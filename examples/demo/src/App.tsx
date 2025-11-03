import React, { useMemo, useState } from 'react';
import BackgroundClient from '../../../src/BackgroundClient';

type PaletteOption = {
  id: string;
  label: string;
  colors?: string[];
};

const paletteOptions: PaletteOption[] = [
  {
    id: 'default',
    label: 'Library default (auto)',
  },
  {
    id: 'sunset',
    label: 'Sunset fade',
    colors: ['#0F172A', '#FB7185', '#F97316', '#FACC15', '#FDE68A'],
  },
  {
    id: 'forest',
    label: 'Forest walk',
    colors: ['#0F3D3E', '#14532D', '#22C55E', '#86EFAC', '#D9F99D'],
  },
  {
    id: 'ocean',
    label: 'Ocean drift',
    colors: ['#03045E', '#0077B6', '#00B4D8', '#48CAE4', '#ADE8F4'],
  },
  {
    id: 'custom',
    label: 'Custom (comma separated HEX)',
  },
];

export default function App() {
  const [selectedPalette, setSelectedPalette] = useState<string>(paletteOptions[0].id);
  const [customInput, setCustomInput] = useState<string>('#36B0AA,#99CCFF,#FF78B4,#4B90D2,#F2E863');

  const activeOption = paletteOptions.find((option) => option.id === selectedPalette) ?? paletteOptions[0];

  const customColors = useMemo(() => {
    return customInput
      .split(',')
      .map((token) => token.trim())
      .filter(Boolean);
  }, [customInput]);

  const paletteColors = activeOption.id === 'custom' ? customColors : activeOption.colors;

  return (
    <div className="app">
      {paletteColors && paletteColors.length ? (
        <BackgroundClient colors={paletteColors} />
      ) : (
        <BackgroundClient />
      )}
      <main className="content" aria-label="paint-background demo">
        <header className="header">
          <h1>paint-background demo</h1>
          <p>Escolha uma paleta e veja o efeito reagir em tempo real.</p>
        </header>

        <section className="panel">
          <label className="field" htmlFor="palette-select">
            <span>Paleta ativa</span>
            <select
              id="palette-select"
              value={selectedPalette}
              onChange={(event) => setSelectedPalette(event.target.value)}
            >
              {paletteOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {activeOption.id === 'custom' ? (
            <label className="field" htmlFor="custom-colors">
              <span>Cores personalizadas</span>
              <textarea
                id="custom-colors"
                value={customInput}
                onChange={(event) => setCustomInput(event.target.value)}
                rows={3}
                placeholder="#36B0AA,#99CCFF,#FF78B4"
              />
            </label>
          ) : (
            <p className="hint">Atualize a seleção para testar diferentes climas visuais.</p>
          )}
        </section>

        <section className="panel">
          <h2>Cores atuais</h2>
          {paletteColors && paletteColors.length ? (
            <ul className="swatches">
              {paletteColors.map((color) => (
                <li key={color} className="swatch">
                  <span className="swatch-chip" style={{ backgroundColor: color }} />
                  <span className="swatch-label">{color}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="hint">Usando a paleta padrão embutida na biblioteca.</p>
          )}
        </section>

        <section className="panel">
          <h2>Como funciona</h2>
          <p>
            O componente <code>{'<Background />'}</code> agora recebe uma lista de cores e monta uma palette dinâmica
            para o shader GLSL por trás do efeito de paint. A paleta é limitada pela capacidade do dispositivo, mas a
            biblioteca aplica automaticamente um limite seguro.
          </p>
        </section>
      </main>
    </div>
  );
}

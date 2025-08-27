figma.on('run', () => {
  figma.showUI(__html__, { width: 340, height: 520, themeColors: true });
});

figma.ui.onmessage = (msg) => {
  if (msg?.type === 'create-frame' && msg?.payload) {
    const { width, height, name } = msg.payload as { width: number; height: number; name: string };
    const frame = figma.createFrame();
    frame.resizeWithoutConstraints(width, height);
    frame.name = name;
    figma.currentPage.appendChild(frame);
    figma.viewport.scrollAndZoomIntoView([frame]);
  }
};


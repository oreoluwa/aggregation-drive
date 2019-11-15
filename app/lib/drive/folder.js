const archiver = require('archiver');
const ManifestInterface = require('./manifestInterface');
const File = require('./file');
const servicesHelper = require('services/helpers');
const { ROOT_PREFIX, ROOT_PREFIX_REGEX } = require('config/components/variables');

class Folder extends ManifestInterface {
  async download (writeableStream, archiveFormat='zip') {
    const archive = archiver(archiveFormat, {
      gzip: true,
      zlib: {
        level: 9,
      },
    });

    archive.pipe(writeableStream);

    const self = this;
    const recurseAppendFile = async (tree, archive) => {
      if (!tree.isDirectory) {
        const file = new File(self.drive, tree);
        const readStream = await file.getReadableStream(tree);
        let filePath = tree.fullPath;
        filePath = filePath.startsWith(ROOT_PREFIX) ? filePath.replace(ROOT_PREFIX_REGEX, '') : filePath;

        return archive.append(readStream, { name: filePath });
      };

      return tree.children.reduce(async (asyncAcc, childTree) => {
        await asyncAcc;
        return recurseAppendFile(childTree, archive);
      }, Promise.resolve());
    };

    await recurseAppendFile(this.manifest, archive);

    return archive.finalize();
  };

  async upload(stream) {
    throw new Error('Cannot upload a folder, but existing folders can be zipped and uploaded to another destination');

    this.download(stream);
  }

  async delete () {
    const self = this;
    return (async function deleteManifest (tree) {
      if (!tree.isDirectory) {
        const file = new File(self.drive, tree);
        await file.delete();
        return true;
      }

      await tree.children.reduce(async (asyncAcc, child) => {
        await asyncAcc;

        return deleteManifest(child);
      }, Promise.resolve());

      return tree.destroy();
    })(this.manifest);
  };

  get size () {
    return (function calculateSize(tree, accSize) {
      return tree.children.reduce((size, child) => {
        if (child.isDirectory) return calculateSize(child, size);
        return size + (child.size || 0);
      }, accSize);
    })(this.manifest, 0);
  };
};

module.exports = Folder;

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import type { Recipe } from '../../types'
import { IMAGE_SLOTS } from '../../types'

function makeStyles(ember: string, print: boolean) {
  const bg        = print ? '#ffffff' : '#1c1917'
  const headerBg  = print ? '#f3f4f6' : '#0c0a09'
  const accent    = print ? '#111111' : ember
  const pillBg    = print ? '#111111' : ember
  const pillText  = '#ffffff'
  const heading   = print ? '#111111' : '#ffffff'
  const subText   = print ? '#374151' : '#a8a29e'
  const bodyText  = print ? '#374151' : '#d6d3d1'
  const mutedText = print ? '#6b7280' : '#78716c'
  const rowBorder = print ? '#d1d5db' : '#44403c'
  const storeBg   = print ? '#f3f4f6' : '#44403c'

  return StyleSheet.create({
    page: { backgroundColor: bg, fontFamily: 'Helvetica', padding: 0 },
    headerBand: {
      backgroundColor: headerBg,
      paddingHorizontal: 40, paddingTop: 36, paddingBottom: 24,
      borderBottomWidth: 3, borderBottomColor: accent,
    },
    categoryPill: {
      backgroundColor: pillBg, borderRadius: 10,
      paddingHorizontal: 8, paddingVertical: 3,
      alignSelf: 'flex-start', marginBottom: 8,
    },
    categoryText: { color: pillText, fontSize: 7, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' },
    recipeName: { color: heading, fontSize: 32, fontWeight: 700, letterSpacing: 2, marginBottom: 4 },
    tagline: { color: subText, fontSize: 11, fontStyle: 'italic' },
    body: { paddingHorizontal: 40, paddingVertical: 28, flexDirection: 'row', gap: 24 },
    leftCol: { flex: 2 },
    sectionLabel: { color: accent, fontSize: 7, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
    description: { color: bodyText, fontSize: 10, lineHeight: 1.6, marginBottom: 20 },
    storageBox: { backgroundColor: storeBg, borderRadius: 6, padding: 10, marginTop: 4 },
    storageText: { color: bodyText, fontSize: 9, lineHeight: 1.5 },
    yieldRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
    yieldLabel: { color: mutedText, fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginRight: 6 },
    yieldValue: { color: accent, fontSize: 11, fontWeight: 700 },
    rightCol: { flex: 3 },
    ingredientRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: rowBorder, paddingVertical: 7 },
    ingredientName: { flex: 1, color: heading, fontSize: 10 },
    ingredientNotes: { flex: 1, color: mutedText, fontSize: 8, fontStyle: 'italic' },
    ingredientAmount: { color: accent, fontSize: 10, fontWeight: 700, fontFamily: 'Helvetica-Bold', minWidth: 50, textAlign: 'right' },
    footer: { marginTop: 'auto', paddingHorizontal: 40, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    footerText: { color: mutedText, fontSize: 7 },
    // Image page
    imgPage: { backgroundColor: bg, fontFamily: 'Helvetica', padding: 32 },
    imgPageTitle: { color: accent, fontSize: 8, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 },
    imgGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    imgCell: { width: '47%' },
    imgLabel: { color: mutedText, fontSize: 7, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
    imgImg: { width: '100%', borderRadius: 4 },
  })
}

interface Props {
  recipe: Recipe
  themeColour: string
  categoryLabel: string
  printerFriendly?: boolean
  pdfIncludeImages?: Record<string, boolean>
}

export default function RecipeCardPDF({ recipe, themeColour, categoryLabel, printerFriendly = false, pdfIncludeImages }: Props) {
  const styles = makeStyles(themeColour, printerFriendly)
  const isSvg = (dataUrl: string) => dataUrl.startsWith('data:image/svg')
  const allEnabledSlots = recipe.images
    ? IMAGE_SLOTS.filter((s) => recipe.images![s.key] && (pdfIncludeImages?.[s.key] ?? true))
    : []
  const imageSlots = allEnabledSlots.filter((s) => !isSvg(recipe.images![s.key]!))
  const svgSlots = allEnabledSlots.filter((s) => isSvg(recipe.images![s.key]!))

  return (
    <Document title={recipe.name} author="Recipe Cards">
      <Page size="A4" style={styles.page} orientation="landscape">
        <View style={styles.headerBand}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{categoryLabel}</Text>
          </View>
          <Text style={styles.recipeName}>{recipe.name.toUpperCase()}</Text>
          <Text style={styles.tagline}>{recipe.tagline}</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.leftCol}>
            <Text style={styles.sectionLabel}>About This Blend</Text>
            <Text style={styles.description}>{recipe.description}</Text>
            {recipe.storageNotes && (
              <>
                <Text style={styles.sectionLabel}>Storage</Text>
                <View style={styles.storageBox}>
                  <Text style={styles.storageText}>{recipe.storageNotes}</Text>
                </View>
              </>
            )}
            <View style={styles.yieldRow}>
              <Text style={styles.yieldLabel}>Batch Yield:</Text>
              <Text style={styles.yieldValue}>{recipe.yieldAmount}{recipe.yieldUnit}</Text>
            </View>
          </View>

          <View style={styles.rightCol}>
            <Text style={styles.sectionLabel}>Ingredients — {recipe.ingredients.length} components</Text>
            {recipe.ingredients.map((ing) => (
              <View key={ing.name} style={styles.ingredientRow}>
                <Text style={styles.ingredientName}>{ing.name}</Text>
                <Text style={styles.ingredientNotes}>{ing.notes ?? ''}</Text>
                <Text style={styles.ingredientAmount}>{ing.amount} {ing.unit}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Recipe Card</Text>
        </View>
      </Page>
      {(imageSlots.length > 0 || svgSlots.length > 0) && (
        <Page size="A4" style={styles.imgPage} orientation="landscape">
          <Text style={styles.imgPageTitle}>{recipe.name.toUpperCase()} — Images</Text>
          {imageSlots.length > 0 && (
            <View style={styles.imgGrid}>
              {imageSlots.map((slot) => (
                <View key={slot.key} style={styles.imgCell}>
                  <Text style={styles.imgLabel}>{slot.label}</Text>
                  <Image style={styles.imgImg} src={recipe.images![slot.key]!} />
                </View>
              ))}
            </View>
          )}
          {svgSlots.length > 0 && (
            <View style={{ marginTop: imageSlots.length > 0 ? 20 : 0 }}>
              <Text style={{ ...styles.imgLabel, marginBottom: 6 }}>SVG images (download from recipe page):</Text>
              {svgSlots.map((slot) => (
                <Text key={slot.key} style={{ ...styles.footerText, marginBottom: 3 }}>• {slot.label}</Text>
              ))}
            </View>
          )}
        </Page>
      )}
    </Document>
  )
}
